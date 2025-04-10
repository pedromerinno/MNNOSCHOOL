
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
  // Function to fetch user roles
  const fetchUserRoles = async (userIds: string[]) => {
    if (userIds.length === 0) return {};
    
    try {
      // First, fetch cargo_id info from profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, cargo_id')
        .in('id', userIds);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return {};
      
      // Filter users with assigned roles
      const usersWithRoles = data.filter(u => u.cargo_id);
      
      if (usersWithRoles.length === 0) {
        console.log("No users with assigned roles");
        return {};
      }
      
      // Extract role IDs for search
      const cargoIds = usersWithRoles
        .map(u => u.cargo_id)
        .filter(Boolean) as string[];
      
      if (cargoIds.length === 0) return {};
      
      console.log(`Fetching ${cargoIds.length} roles`);
      
      // Fetch role details
      const { data: rolesData, error: rolesError } = await supabase
        .from('job_roles')
        .select('id, title')
        .in('id', cargoIds);
        
      if (rolesError) throw rolesError;
      
      if (!rolesData || rolesData.length === 0) return {};
      
      console.log(`Found ${rolesData.length} roles`);
      
      // Create role name map
      const roleNameMap: Record<string, string> = {};
      rolesData.forEach((role: any) => {
        roleNameMap[role.id] = role.title;
      });
      
      // Map users to their role names
      const roleMap: Record<string, string> = {};
      usersWithRoles.forEach(user => {
        if (user.cargo_id && roleNameMap[user.cargo_id]) {
          roleMap[user.id] = roleNameMap[user.cargo_id];
        }
      });
      
      return roleMap;
    } catch (error: any) {
      console.error("Error fetching user roles:", error);
      // Don't show toast here, just log error and return empty object
      return {};
    }
  };

  // Function to fetch full user profiles
  const fetchFullUserProfiles = async (userIds: string[]): Promise<UserProfile[]> => {
    if (userIds.length === 0) return [];
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, is_admin')
        .in('id', userIds);
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log("No user profiles found");
        return [];
      }
      
      return data as UserProfile[];
    } catch (error: any) {
      console.error("Error fetching user profiles:", error);
      // Don't show toast here, just log error and return empty array
      return [];
    }
  };

  // Function to fetch company users
  const fetchCompanyUsers = useCallback(async (company: Company | null) => {
    if (!company || !company.id) {
      console.log("No company selected or company has no ID");
      setIsLoading(false);
      setCompanyUsers([]);
      setError(null);
      initialFetchDone.current = true;
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching collaborators for company:", company.nome, company.id);
      
      // Get user_empresa relations for this company
      const { data, error } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', company.id);
        
      if (error) {
        console.error("Error fetching user_empresa relations:", error);
        setError("Falha ao carregar colaboradores. Erro de banco de dados.");
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No collaborators found for this company");
        setCompanyUsers([]);
        setUserRoles({});
        setIsLoading(false);
        initialFetchDone.current = true;
        return [];
      }
      
      console.log(`Found ${data.length} collaborators`);
      const userIds = data.map(item => item.user_id);
      
      // Execute role fetching and profile fetching in parallel
      const [roleMap, profiles] = await Promise.all([
        fetchUserRoles(userIds),
        fetchFullUserProfiles(userIds)
      ]);
      
      // Set user roles
      setUserRoles(roleMap);
      
      // Set complete user profiles instead of just IDs
      setCompanyUsers(profiles);
      
      setIsLoading(false);
      initialFetchDone.current = true;
      return profiles;
    } catch (error: any) {
      console.error("Error fetching company users:", error);
      setIsLoading(false);
      initialFetchDone.current = true;
      setCompanyUsers([]);
      setUserRoles({});
      setError(`Falha ao carregar colaboradores: ${error.message}`);
      
      // Only show toast for network errors, not permission errors
      if (!error.message.includes("permission denied")) {
        toast.error(`Erro ao carregar colaboradores: ${error.message}`);
      }
      return [];
    }
  }, [setCompanyUsers, setIsLoading, setUserRoles, initialFetchDone, setError]);

  return { fetchCompanyUsers, fetchFullUserProfiles };
};
