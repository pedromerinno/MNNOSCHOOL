
import { useCallback, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from '@/hooks/useUsers';

export const useCompanyUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  
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
      return true;
    } catch (error) {
      console.error('Error removing user from company:', error);
      toast.error("Erro ao remover usuário da empresa");
      throw error;
    }
  }, []);
  
  const getCompanyUsers = useCallback(async (companyId: string): Promise<UserProfile[]> => {
    try {
      const { data: userCompanyRelations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', companyId);
        
      if (relationsError) throw relationsError;
      
      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        return [];
      }
      
      const userIds = userCompanyRelations.map(relation => relation.user_id);
      
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      if (usersError) throw usersError;
      
      return users as UserProfile[];
    } catch (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }
  }, []);
  
  return {
    assignUserToCompany,
    removeUserFromCompany,
    getCompanyUsers,
    isLoading
  };
};
