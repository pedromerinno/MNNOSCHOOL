
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
  // Function to fetch user roles - otimizada
  const fetchUserRoles = async (userIds: string[]) => {
    if (userIds.length === 0) return {};
    
    try {
      // Query otimizada com joins para buscar roles em uma única consulta
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
        .not('cargo_id', 'is', null);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return {};
      
      // Mapear roles diretamente dos dados retornados
      const roleMap: Record<string, string> = {};
      data.forEach((user: any) => {
        if (user.job_roles && user.job_roles.title) {
          roleMap[user.id] = user.job_roles.title;
        }
      });
      
      return roleMap;
    } catch (error: any) {
      console.error("Error fetching user roles:", error);
      return {};
    }
  };

  // Function to fetch full user profiles - otimizada
  const fetchFullUserProfiles = async (userIds: string[]): Promise<UserProfile[]> => {
    if (userIds.length === 0) return [];
    
    try {
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
        .limit(50); // Limitar resultados para performance
        
      if (error) throw error;
      
      return data as UserProfile[] || [];
    } catch (error: any) {
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

    // Evitar fetch duplicado
    if (initialFetchDone.current) {
      console.log("Company users already fetched, skipping...");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(`[useFetchCompanyUsers] Fetching users for company: ${company.id}`);

      // Query otimizada - buscar apenas IDs dos usuários primeiro
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', company.id)
        .limit(100); // Limitar para performance

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

      // Buscar perfis dos usuários e roles em paralelo para melhor performance
      const [userProfiles, userRoles] = await Promise.all([
        fetchFullUserProfiles(userIds),
        fetchUserRoles(userIds)
      ]);

      console.log(`Loaded ${userProfiles.length} user profiles and ${Object.keys(userRoles).length} roles`);

      setCompanyUsers(userProfiles);
      setUserRoles(userRoles);
      initialFetchDone.current = true;

    } catch (error: any) {
      console.error("[useFetchCompanyUsers] Error fetching company users:", error);
      setError(error.message || "Erro ao carregar colaboradores");
      
      // Não mostrar toast para evitar spam de erros
      if (!error.message?.includes('storage/bucket-not-found')) {
        toast.error("Erro ao carregar colaboradores");
      }
    } finally {
      setIsLoading(false);
    }
  }, [setCompanyUsers, setIsLoading, setUserRoles, initialFetchDone, setError]);

  return { fetchCompanyUsers };
};
