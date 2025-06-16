
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { UserProfile } from "@/hooks/useUsers";

export const useFetchCompanyUsers = (
  setCompanyUsers: (users: UserProfile[]) => void,
  setIsLoading: (loading: boolean) => void,
  setUserRoles: (roles: Record<string, string>) => void,
  initialFetchDone: React.MutableRefObject<boolean>,
  setError: (error: string | null) => void
) => {
  // Function to fetch user roles - super otimizada
  const fetchUserRoles = async (userIds: string[]) => {
    if (userIds.length === 0) return {};
    
    try {
      console.log(`[fetchUserRoles] Fetching roles for ${userIds.length} users`);
      
      // Query ultra-otimizada com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          cargo_id,
          job_roles!left(
            id,
            title
          )
        `)
        .in('id', userIds)
        .not('cargo_id', 'is', null)
        .limit(50)
        .abortSignal(controller.signal);
        
      clearTimeout(timeoutId);
      
      if (error) throw error;
      
      const roleMap: Record<string, string> = {};
      data?.forEach((user: any) => {
        if (user.job_roles?.title) {
          roleMap[user.id] = user.job_roles.title;
        }
      });
      
      console.log(`[fetchUserRoles] Found ${Object.keys(roleMap).length} roles`);
      return roleMap;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("fetchUserRoles timeout");
        return {};
      }
      console.error("Error fetching user roles:", error);
      return {};
    }
  };

  // Function to fetch full user profiles - super otimizada
  const fetchFullUserProfiles = async (userIds: string[]): Promise<UserProfile[]> => {
    if (userIds.length === 0) return [];
    
    try {
      console.log(`[fetchFullUserProfiles] Fetching ${userIds.length} profiles`);
      
      // Query com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          display_name, 
          email, 
          is_admin, 
          super_admin, 
          avatar,
          created_at,
          cargo_id
        `)
        .in('id', userIds)
        .order('display_name', { ascending: true })
        .limit(100) // Limitar mais ainda
        .abortSignal(controller.signal);
        
      clearTimeout(timeoutId);
      
      if (error) throw error;
      
      console.log(`[fetchFullUserProfiles] Loaded ${data?.length || 0} profiles`);
      return data as UserProfile[] || [];
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("fetchFullUserProfiles timeout");
        throw new Error("Timeout ao carregar perfis dos usuários");
      }
      console.error("Error fetching user profiles:", error);
      throw error;
    }
  };

  const fetchCompanyUsers = useCallback(async (company: Company) => {
    if (!company?.id) {
      console.warn("No company ID provided");
      setCompanyUsers([]);
      setUserRoles({});
      return;
    }

    // Cache key para esta company
    const cacheKey = `company-users-${company.id}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    // Se tem cache e não passou muito tempo (5 minutos), usar cache
    if (cached && !initialFetchDone.current) {
      try {
        const { users, roles, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < 300000) { // 5 minutos
          console.log("Using cached company users data");
          setCompanyUsers(users);
          setUserRoles(roles);
          initialFetchDone.current = true;
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Failed to parse cached data, fetching fresh");
      }
    }

    // Evitar fetch duplicado
    if (initialFetchDone.current) {
      console.log("Company users already fetched, skipping...");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[useFetchCompanyUsers] Starting fetch for company: ${company.id}`);
      const startTime = Date.now();

      // Step 1: Buscar apenas IDs dos usuários com timeout agressivo
      const controller1 = new AbortController();
      const timeoutId1 = setTimeout(() => controller1.abort(), 8000); // 8s timeout
      
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', company.id)
        .limit(50) // Limitar mais para performance
        .abortSignal(controller1.signal);

      clearTimeout(timeoutId1);

      if (userCompanyError) throw userCompanyError;

      if (!userCompanyData || userCompanyData.length === 0) {
        console.log("No users found for company");
        setCompanyUsers([]);
        setUserRoles({});
        initialFetchDone.current = true;
        
        // Cache resultado vazio também
        sessionStorage.setItem(cacheKey, JSON.stringify({
          users: [],
          roles: {},
          timestamp: Date.now()
        }));
        
        return;
      }

      const userIds = userCompanyData.map(item => item.user_id);
      console.log(`Found ${userIds.length} users for company`);

      // Step 2: Buscar perfis e roles em paralelo com Promise.allSettled para não falhar tudo se um falhar
      const [profilesResult, rolesResult] = await Promise.allSettled([
        fetchFullUserProfiles(userIds),
        fetchUserRoles(userIds)
      ]);

      let userProfiles: UserProfile[] = [];
      let userRoles: Record<string, string> = {};

      if (profilesResult.status === 'fulfilled') {
        userProfiles = profilesResult.value;
      } else {
        console.error("Failed to fetch profiles:", profilesResult.reason);
        throw new Error("Falha ao carregar perfis dos usuários");
      }

      if (rolesResult.status === 'fulfilled') {
        userRoles = rolesResult.value;
      } else {
        console.warn("Failed to fetch roles, continuing without them:", rolesResult.reason);
        // Não falhar por causa dos roles
      }

      const endTime = Date.now();
      console.log(`[useFetchCompanyUsers] Completed in ${endTime - startTime}ms. Loaded ${userProfiles.length} profiles and ${Object.keys(userRoles).length} roles`);

      setCompanyUsers(userProfiles);
      setUserRoles(userRoles);
      initialFetchDone.current = true;

      // Cache os resultados
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          users: userProfiles,
          roles: userRoles,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn("Failed to cache results:", e);
      }

    } catch (error: any) {
      console.error("[useFetchCompanyUsers] Error fetching company users:", error);
      
      if (error.name === 'AbortError') {
        setError("Timeout - A consulta demorou muito para responder");
      } else {
        setError(error.message || "Erro ao carregar colaboradores");
      }
      
      // Não mostrar toast para timeouts ou erros conhecidos
      if (!error.message?.includes('timeout') && !error.message?.includes('storage/bucket-not-found')) {
        toast.error("Erro ao carregar colaboradores");
      }
    } finally {
      setIsLoading(false);
    }
  }, [setCompanyUsers, setIsLoading, setUserRoles, initialFetchDone, setError]);

  return { fetchCompanyUsers };
};
