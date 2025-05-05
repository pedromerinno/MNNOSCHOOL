
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseCompanyUserRelationshipProps {
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useCompanyUserRelationship = ({ 
  setIsLoading, 
  setError 
}: UseCompanyUserRelationshipProps) => {
  
  const assignUserToCompany = useCallback(async (userId: string, companyId: string, isAdmin: boolean = false) => {
    setIsLoading(true);
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
      setError(error instanceof Error ? error : new Error('Failed to assign user to company'));
      toast.error("Erro ao adicionar usuário à empresa");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError]);
  
  const removeUserFromCompany = useCallback(async (userId: string, companyId: string) => {
    setIsLoading(true);
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
      setError(error instanceof Error ? error : new Error('Failed to remove user from company'));
      toast.error("Erro ao remover usuário da empresa");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError]);
  
  return {
    assignUserToCompany,
    removeUserFromCompany
  };
};
