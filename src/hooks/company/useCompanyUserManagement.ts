
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/useUsers";

export const useCompanyUserManagement = () => {
  const [loading, setLoading] = useState(false);
  
  /**
   * Assign a user to a company
   */
  const assignUserToCompany = async (userId: string, companyId: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Check if the relation already exists
      const { data: existingData, error: existingError } = await supabase
        .from('user_empresa')
        .select('*')
        .eq('user_id', userId)
        .eq('empresa_id', companyId)
        .single();
      
      if (existingError && existingError.code !== 'PGRST116') {
        throw new Error(`Error checking existing relation: ${existingError.message}`);
      }
      
      // If relation already exists, return success
      if (existingData) {
        console.log('User already assigned to company');
        return true;
      }
      
      // Create a new relation
      const { error } = await supabase
        .from('user_empresa')
        .insert([
          { user_id: userId, empresa_id: companyId }
        ]);
      
      if (error) {
        throw new Error(`Error assigning user to company: ${error.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in assignUserToCompany:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Remove a user from a company
   */
  const removeUserFromCompany = async (userId: string, companyId: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('empresa_id', companyId);
      
      if (error) {
        throw new Error(`Error removing user from company: ${error.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in removeUserFromCompany:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get all users assigned to a company
   */
  const getCompanyUsers = async (companyId: string): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('user_empresa')
        .select(`
          user_id,
          profiles:user_id (
            id,
            display_name,
            avatar,
            is_admin
          )
        `)
        .eq('empresa_id', companyId);
      
      if (error) {
        throw new Error(`Error fetching company users: ${error.message}`);
      }
      
      // Also fetch email for each user
      const userIds = data.map((item: any) => item.profiles.id);
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });
      
      if (usersError) {
        console.error('Error fetching user emails:', usersError);
      }
      
      // Map the users with their email
      const users = data.map((item: any) => {
        const profile = item.profiles;
        const userData = usersData?.users.find((u: any) => u.id === profile.id);
        
        return {
          id: profile.id,
          display_name: profile.display_name,
          avatar: profile.avatar,
          is_admin: profile.is_admin,
          email: userData?.email || '(email não disponível)'
        };
      });
      
      return users;
    } catch (error: any) {
      console.error('Error in getCompanyUsers:', error);
      return [];
    }
  };
  
  return {
    loading,
    assignUserToCompany,
    removeUserFromCompany,
    getCompanyUsers
  };
};
