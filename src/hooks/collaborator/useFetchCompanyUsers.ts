
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
      
      console.log(`[useFetchCompanyUsers] Starting optimized fetch for company: ${company.id}`);
      const startTime = Date.now();

      // Single optimized query with join - aumentando timeout para 20s
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout mais tolerante
      
      const { data, error } = await supabase
        .from('user_empresa')
        .select(`
          user_id,
          profiles!inner(
            id, 
            display_name, 
            email, 
            is_admin, 
            super_admin, 
            avatar,
            created_at,
            cargo_id,
            job_roles(
              id,
              title
            )
          )
        `)
        .eq('empresa_id', company.id)
        .limit(50)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

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
            is_admin: item.profiles.is_admin,
            super_admin: item.profiles.super_admin,
            avatar: item.profiles.avatar,
            created_at: item.profiles.created_at,
            cargo_id: item.profiles.cargo_id
          });
          
          if (item.profiles.job_roles?.title) {
            roles[item.profiles.id] = item.profiles.job_roles.title;
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
        setError("Timeout - A consulta demorou muito para responder. Tente novamente.");
      } else {
        setError(error.message || "Erro ao carregar colaboradores");
      }
      
      // Não mostrar toast para timeouts para evitar spam
      if (!error.message?.includes('timeout') && !error.message?.includes('Timeout')) {
        toast.error("Erro ao carregar colaboradores");
      }
    } finally {
      setIsLoading(false);
    }
  }, [setCompanyUsers, setIsLoading, setUserRoles, initialFetchDone, setError]);

  return { fetchCompanyUsers };
};
