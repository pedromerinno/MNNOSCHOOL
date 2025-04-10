
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCompanyUserManagement = () => {
  /**
   * Assign a user to a company
   */
  const assignUserToCompany = useCallback(async (userId: string, companyId: string) => {
    try {
      // Check if relation already exists
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_empresa')
        .select('id')
        .eq('user_id', userId)
        .eq('empresa_id', companyId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking user-company relation:', checkError);
        toast.error("Erro ao verificar relação existente");
        return false;
      }
      
      // If relation already exists, no need to create it again
      if (existingRelation) {
        console.log('User already assigned to this company');
        toast.success("Usuário já está associado a esta empresa");
        return true;
      }
      
      // Create new relation
      const { error } = await supabase
        .from('user_empresa')
        .insert({
          user_id: userId,
          empresa_id: companyId
        });
        
      if (error) {
        console.error('Error assigning user to company:', error);
        toast.error("Erro ao associar usuário à empresa");
        return false;
      }
      
      toast.success("Usuário associado à empresa com sucesso");
      
      // Trigger company relation change event
      window.dispatchEvent(new Event('company-relation-changed'));
      
      return true;
    } catch (error) {
      console.error('Unexpected error assigning user to company:', error);
      toast.error("Erro inesperado ao associar usuário");
      return false;
    }
  }, []);
  
  /**
   * Remove a user from a company
   */
  const removeUserFromCompany = useCallback(async (userId: string, companyId: string) => {
    try {
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('empresa_id', companyId);
        
      if (error) {
        console.error('Error removing user from company:', error);
        toast.error("Erro ao remover usuário da empresa");
        return false;
      }
      
      toast.success("Usuário removido da empresa com sucesso");
      
      // Trigger company relation change event
      window.dispatchEvent(new Event('company-relation-changed'));
      
      return true;
    } catch (error) {
      console.error('Unexpected error removing user from company:', error);
      toast.error("Erro inesperado ao remover usuário");
      return false;
    }
  }, []);
  
  return {
    assignUserToCompany,
    removeUserFromCompany
  };
};
