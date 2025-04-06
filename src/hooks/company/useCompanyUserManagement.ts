
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/hooks/useUsers";

export const useCompanyUserManagement = () => {
  /**
   * Clears all relevant caches related to companies and user selections
   */
  const clearCompanyCaches = () => {
    console.log('Clearing company caches');
    
    // Clear all localStorage items related to companies
    const keysToRemove = [
      'userCompanies',
      'userCompaniesTimestamp',
      'selectedCompanyId',
      'selectedCompany'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`Removing ${key} from localStorage`);
        localStorage.removeItem(key);
      }
    });
    
    // Dispatch an event to notify components to refresh
    window.dispatchEvent(new CustomEvent('company-relation-changed'));
  };

  /**
   * Assigns a user to a company
   */
  const assignUserToCompany = async (userId: string, companyId: string): Promise<boolean> => {
    try {
      console.log(`Assigning user ${userId} to company ${companyId}`);
      
      // Check if relationship already exists to avoid duplicates
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_empresa')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking existing relationship:", checkError);
        toast("Erro ao verificar relação", {
          description: checkError.message,
        });
        return false;
      }
      
      // If relationship already exists, return success
      if (existingRelation) {
        console.log("Relationship already exists, skipping creation");
        toast("Usuário já associado", {
          description: "Este usuário já está associado à empresa",
        });
        return true;
      }

      // Create the new relationship
      const { error } = await supabase
        .from('user_empresa')
        .insert([{ 
          user_id: userId, 
          company_id: companyId 
        }]);

      if (error) {
        console.error("Error assigning user to company:", error);
        
        // Provide a user-friendly error message
        const errorMessage = error.code === '42501' || error.message.includes('permission')
          ? "Permissão negada. Seu usuário não tem acesso para realizar esta operação."
          : error.message;
          
        toast("Erro ao adicionar usuário à empresa", {
          description: errorMessage,
        });
        return false;
      }

      // Clear caches to ensure UI is updated
      clearCompanyCaches();

      toast("Usuário adicionado", {
        description: "O usuário foi adicionado à empresa com sucesso",
      });
      
      return true;
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao adicionar o usuário à empresa",
      });
      return false;
    }
  };

  /**
   * Removes a user from a company
   */
  const removeUserFromCompany = async (userId: string, companyId: string): Promise<boolean> => {
    try {
      console.log(`Removing user ${userId} from company ${companyId}`);
      
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) {
        console.error("Error removing user from company:", error);
        
        // Provide a user-friendly error message
        const errorMessage = error.code === '42501' || error.message.includes('permission')
          ? "Permissão negada. Seu usuário não tem acesso para realizar esta operação."
          : error.message;
          
        toast("Erro ao remover usuário da empresa", {
          description: errorMessage,
        });
        return false;
      }

      // Clear caches to ensure UI is updated immediately
      clearCompanyCaches();

      toast("Usuário removido", {
        description: "O usuário foi removido da empresa com sucesso",
      });
      
      return true;
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao remover o usuário da empresa",
      });
      return false;
    }
  };

  /**
   * Fetches users associated with a company
   */
  const getCompanyUsers = async (companyId: string): Promise<UserProfile[]> => {
    try {
      console.log(`Fetching users for company: ${companyId}`);
      
      // Fetch the user-company relationships
      const { data: relationships, error: relError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('company_id', companyId);
        
      if (relError) {
        console.error('Error fetching company user relationships:', relError);
        throw relError;
      }
      
      if (!relationships || relationships.length === 0) {
        return [];
      }
      
      // Extract the user IDs
      const userIds = relationships.map(rel => rel.user_id);
      
      // Get the full user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar, is_admin')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        throw profilesError;
      }
      
      // Transform database profiles to UserProfile format, adding email field
      // to match the UserProfile interface
      const userProfiles: UserProfile[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.display_name 
          ? `${profile.display_name.toLowerCase().replace(/\s+/g, '.')}@user.com` 
          : `user-${profile.id.substring(0, 8)}@example.com`,
        display_name: profile.display_name || `User ${profile.id.substring(0, 6)}`,
        is_admin: profile.is_admin || false
      }));
      
      return userProfiles;
    } catch (error) {
      console.error('Error in getCompanyUsers:', error);
      throw error;
    }
  };

  return {
    assignUserToCompany,
    removeUserFromCompany,
    getCompanyUsers,
    clearCompanyCaches
  };
};
