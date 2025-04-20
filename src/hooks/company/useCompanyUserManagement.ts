
import { useCallback } from 'react';
import { useCompanyUserRelationship } from './useCompanyUserRelationship';
import { toast } from 'sonner';

export const useCompanyUserManagement = () => {
  const { assignUserToCompany: assign, removeUserFromCompany: remove } = useCompanyUserRelationship({
    setIsLoading: () => {},
    setError: () => {}
  });

  const assignUserToCompany = useCallback(async (userId: string, companyId: string) => {
    try {
      await assign(userId, companyId);
      toast.success("Usuário associado à empresa com sucesso");
    } catch (error) {
      console.error('Error assigning user to company:', error);
      toast.error("Erro ao associar usuário à empresa");
    }
  }, [assign]);

  const removeUserFromCompany = useCallback(async (userId: string, companyId: string) => {
    try {
      await remove(userId, companyId);
      toast.success("Usuário removido da empresa com sucesso");
    } catch (error) {
      console.error('Error removing user from company:', error);
      toast.error("Erro ao remover usuário da empresa");
    }
  }, [remove]);

  return {
    assignUserToCompany,
    removeUserFromCompany
  };
};
