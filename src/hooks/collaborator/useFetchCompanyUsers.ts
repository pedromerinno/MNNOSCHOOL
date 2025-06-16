
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
  // Function to fetch users with roles in a single optimized query
  const fetchCompanyUsersWithRoles = async (userIds: string[]): Promise<{ users: UserProfile[], roles: Record<string, string> }> => {
    if (userIds.length === 0) return { users: [], roles: {} };
    
    try {
      console.log(`[fetchCompanyUsersWithRoles] Fetching ${userIds.length} users with roles`);
      
      // Single optimized query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
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
          cargo_id,
          job_roles!left(
            id,
            title
          )
        `)
        .in('id', userIds)
        .order('display_name', { ascending: true })
        .limit(50)
        .abortSignal(controller.signal);
        
      clearTimeout(timeoutId);
      
      if (error) throw error;
      
      const users: UserProfile[] = [];
      const roles: Record<string, string> = {};
      
      data?.forEach((user: any) => {
        users.push({
          id: user.id,
          display_name: user.display_name,
          email: user.email,
          is_admin: user.is_admin,
          super_admin: user.super_admin,
          avatar: user.avatar,
          created_at: user.created_at,
          cargo_id: user.cargo_id
        });
        
        if (user.job_roles?.title) {
          roles[user.id] = user.job_roles.title;
        }
      });
      
      console.log(`[fetchCompanyUsersWithRoles] Loaded ${users.length} users and ${Object.keys(roles).length} roles`);
      return { users, roles };
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("fetchCompanyUsersWithRoles timeout");
        throw new Error("Timeout ao carregar dados dos usuários");
      }
      console.error("Error fetching users with roles:", error);
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

      // Step 1: Buscar apenas IDs dos usuários com timeout otimizado
      const controller1 = new AbortController();
      const timeoutId1 = setTimeout(() => controller1.abort(), 5000); // 5s timeout mais agressivo
      
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', company.id)
        .limit(30) // Limitar ainda mais para performance
        .abortSignal(controller1.signal);

      clearTimeout(timeoutId1);

      if (userCompanyError) throw userCompanyError;

      if (!userCompanyData || userCompanyData.length === 0) {
        console.log("No users found for company");
        setCompanyUsers([]);
        setUserRoles({});
        initialFetchDone.current = true;
        return;
      }

      const userIds = userCompanyData.map(item => item.user_id);
      console.log(`Found ${userIds.length} users for company`);

      // Step 2: Buscar perfis e roles em uma única query otimizada
      const { users, roles } = await fetchCompanyUsersWithRoles(userIds);

      const endTime = Date.now();
      console.log(`[useFetchCompanyUsers] Completed in ${endTime - startTime}ms. Loaded ${users.length} profiles and ${Object.keys(roles).length} roles`);

      setCompanyUsers(users);
      setUserRoles(roles);
      initialFetchDone.current = true;

    } catch (error: any) {
      console.error("[useFetchCompanyUsers] Error fetching company users:", error);
      
      if (error.name === 'AbortError') {
        setError("Timeout - A consulta demorou muito para responder");
      } else {
        setError(error.message || "Erro ao carregar colaboradores");
      }
      
      // Não mostrar toast para timeouts
      if (!error.message?.includes('timeout') && !error.message?.includes('Timeout')) {
        toast.error("Erro ao carregar colaboradores");
      }
    } finally {
      setIsLoading(false);
    }
  }, [setCompanyUsers, setIsLoading, setUserRoles, initialFetchDone, setError]);

  return { fetchCompanyUsers };
};
