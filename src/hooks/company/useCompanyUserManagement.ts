
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCompanyUserManagement = () => {
  
  const assignUserToCompany = useCallback(async (userId: string, companyId: string, isAdmin: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('user_empresa')
        .insert({
          user_id: userId,
          empresa_id: companyId,
          is_admin: isAdmin
        })
        .select()
        .single();
  
      if (error) throw error;
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('company-relation-changed'));
      
      toast.success("Usuário adicionado à empresa com sucesso!");
      return data;
    } catch (error) {
      console.error('Error assigning user to company:', error);
      toast.error("Erro ao adicionar usuário à empresa");
      throw error;
    }
  }, []);
  
  const removeUserFromCompany = useCallback(async (userId: string, companyId: string) => {
    try {
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .match({
          user_id: userId,
          empresa_id: companyId
        });
  
      if (error) throw error;
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('company-relation-changed'));
      
      toast.success("Usuário removido da empresa com sucesso!");
    } catch (error) {
      console.error('Error removing user from company:', error);
      toast.error("Erro ao remover usuário da empresa");
      throw error;
    }
  }, []);
  
  return {
    assignUserToCompany,
    removeUserFromCompany
  };
};
