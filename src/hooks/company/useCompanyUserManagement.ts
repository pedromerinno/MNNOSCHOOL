
import { useCallback } from 'react';
import { useCompanyUserRelationship } from './useCompanyUserRelationship';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/hooks/useUsers';

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

  // Add the getCompanyUsers function
  const getCompanyUsers = useCallback(async (companyId: string): Promise<UserProfile[]> => {
    try {
      // Get user IDs associated with the company
      const { data: userCompanyRelations, error: relationError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', companyId);

      if (relationError) throw relationError;
      
      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        return [];
      }

      // Get user profile data for each user ID
      const userIds = userCompanyRelations.map(relation => relation.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      
      return profiles || [];
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast.error("Erro ao buscar usuários da empresa");
      return [];
    }
  }, []);

  return {
    assignUserToCompany,
    removeUserFromCompany,
    getCompanyUsers
  };
};
