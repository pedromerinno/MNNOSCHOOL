
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/useUsers";
import { toast } from "sonner";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";

export const useCompanyUserManagement = () => {
  const { clearCachedUserCompanies } = useCompanyCache();
  
  /**
   * Fetches all users associated with a company
   */
  const getCompanyUsers = useCallback(async (companyId: string): Promise<UserProfile[]> => {
    try {
      // Get user_empresa entries for this company
      const { data: userRelations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('company_id', companyId);
        
      if (relationsError) {
        throw new Error(`Error fetching user relations: ${relationsError.message}`);
      }
      
      if (!userRelations || userRelations.length === 0) {
        return [];
      }
      
      // Extract user IDs
      const userIds = userRelations.map(relation => relation.user_id);
      
      // Get user details from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar, is_admin')
        .in('id', userIds);
        
      if (profilesError) {
        throw new Error(`Error fetching user profiles: ${profilesError.message}`);
      }
      
      // Map the profile data to UserProfile format
      return profiles.map(profile => ({
        id: profile.id,
        // Generate email from display_name or use fallback with id
        email: profile.display_name 
          ? `${profile.display_name.toLowerCase().replace(/\s+/g, '.')}@user.com` 
          : `user-${profile.id.substring(0, 8)}@example.com`,
        display_name: profile.display_name || '',
        avatar: profile.avatar || '',
        is_admin: profile.is_admin || false
      }));
    } catch (error) {
      console.error("Error getting company users:", error);
      throw error;
    }
  }, []);
  
  /**
   * Assigns a user to a company
   */
  const assignUserToCompany = useCallback(async (userId: string, companyId: string): Promise<boolean> => {
    try {
      // Check if relation already exists
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_empresa')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .maybeSingle();
        
      if (checkError) {
        throw new Error(`Error checking user-company relation: ${checkError.message}`);
      }
      
      // If relation already exists, do nothing
      if (existingRelation) {
        toast.info("O usuário já está associado a esta empresa");
        return true;
      }
      
      // Add relation
      const { error } = await supabase
        .from('user_empresa')
        .insert({ user_id: userId, company_id: companyId });
        
      if (error) {
        throw new Error(`Error assigning user to company: ${error.message}`);
      }
      
      // Clear cache to force fresh data on next load
      clearCachedUserCompanies();
      
      // Notify user
      toast.success("Usuário associado à empresa com sucesso");
      return true;
    } catch (error) {
      console.error("Error assigning user to company:", error);
      toast.error("Erro ao associar usuário à empresa");
      return false;
    }
  }, [clearCachedUserCompanies]);
  
  /**
   * Removes a user from a company
   */
  const removeUserFromCompany = useCallback(async (userId: string, companyId: string): Promise<boolean> => {
    try {
      // Remove relation
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);
        
      if (error) {
        throw new Error(`Error removing user from company: ${error.message}`);
      }
      
      // Clear cache to force fresh data on next load
      clearCachedUserCompanies();
      
      // Notify user
      toast.success("Usuário removido da empresa com sucesso");
      return true;
    } catch (error) {
      console.error("Error removing user from company:", error);
      toast.error("Erro ao remover usuário da empresa");
      return false;
    }
  }, [clearCachedUserCompanies]);
  
  return {
    getCompanyUsers,
    assignUserToCompany,
    removeUserFromCompany
  };
};
