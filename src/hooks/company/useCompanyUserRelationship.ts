
import { useCallback } from "react";
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
  const assignUserToCompany = useCallback(async (userId: string, companyId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_empresa')
        .insert([{ user_id: userId, empresa_id: companyId }]);
  
      if (error) throw error;
      
      window.dispatchEvent(new Event('company-relation-changed'));
      toast.success("Usuário associado à empresa com sucesso!");
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error : new Error('Failed to assign user to company'));
      toast.error("Erro ao associar usuário à empresa");
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
        .eq('user_id', userId)
        .eq('empresa_id', companyId);
  
      if (error) throw error;
      
      window.dispatchEvent(new Event('company-relation-changed'));
      toast.success("Usuário removido da empresa com sucesso!");
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error : new Error('Failed to remove user from company'));
      toast.error("Erro ao remover usuário da empresa");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError]);

  return {
    assignUserToCompany,
    removeUserFromCompany
  };
};
