
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
  const fetchCompanyUsers = useCallback(async (company: Company) => {
    if (!company?.id) {
      console.warn("No company ID provided");
      setCompanyUsers([]);
      setUserRoles({});
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[useFetchCompanyUsers] Starting fetch for company: ${company.id}`);
      const startTime = Date.now();

      // Single optimized query - buscar cargo de user_empresa (nova estrutura)
      const { data, error } = await supabase
        .from('user_empresa')
        .select(`
          user_id,
          is_admin,
          cargo_id,
          profiles!inner(
            id, 
            display_name, 
            email, 
            super_admin, 
            avatar,
            created_at
          )
        `)
        .eq('empresa_id', company.id)
        .limit(50);

      // Buscar cargos separadamente para evitar problemas de join
      const cargoIds = data?.filter(item => item.cargo_id).map(item => item.cargo_id) || [];
      const jobRolesMap: Record<string, any> = {};
      
      if (cargoIds.length > 0) {
        const { data: rolesData } = await supabase
          .from('job_roles')
          .select('id, title')
          .in('id', cargoIds);
        
        if (rolesData) {
          rolesData.forEach(role => {
            jobRolesMap[role.id] = role;
          });
        }
      }

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log("No users found for company");
        setCompanyUsers([]);
        setUserRoles({});
        initialFetchDone.current = true;
        return;
      }

      const users: UserProfile[] = [];
      const roles: Record<string, string> = {};

      data.forEach((item: any) => {
        if (item.profiles) {
          users.push({
            id: item.profiles.id,
            display_name: item.profiles.display_name,
            email: item.profiles.email,
            is_admin: item.is_admin || false, // Admin por empresa
            super_admin: item.profiles.super_admin || false,
            avatar: item.profiles.avatar,
            created_at: item.profiles.created_at,
            cargo_id: item.cargo_id || null // Cargo por empresa (nova estrutura)
          });
          
          // Buscar título do cargo do map
          if (item.cargo_id && jobRolesMap[item.cargo_id]) {
            roles[item.profiles.id] = jobRolesMap[item.cargo_id].title;
          }
        }
      });

      const endTime = Date.now();
      console.log(`[useFetchCompanyUsers] Completed in ${endTime - startTime}ms. Loaded ${users.length} profiles and ${Object.keys(roles).length} roles`);

      setCompanyUsers(users);
      setUserRoles(roles);
      initialFetchDone.current = true;

    } catch (error: any) {
      console.error("[useFetchCompanyUsers] Error fetching company users:", error);
      
      if (error.name === 'AbortError') {
        console.log("[useFetchCompanyUsers] Request was aborted - this is normal if user navigated away");
        return; // Don't show error for aborted requests
      }
      
      setError(error.message || "Erro ao carregar colaboradores");
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setIsLoading(false);
    }
  }, [setCompanyUsers, setIsLoading, setUserRoles, initialFetchDone, setError]);

  return { fetchCompanyUsers };
};
