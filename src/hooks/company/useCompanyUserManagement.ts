import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";

export const useCompanyUserManagement = () => {
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
      
      toast.success("Removido da empresa com sucesso");
      
      // Trigger company relation change event
      window.dispatchEvent(new Event('company-relation-changed'));
      
      return true;
    } catch (error) {
      console.error('Unexpected error removing user from company:', error);
      toast.error("Erro inesperado ao remover usuário");
      return false;
    }
  }, []);
  
  const getCompanyUsers = useCallback(async (companyId: string): Promise<UserProfile[]> => {
    try {
      // Check if user belongs to company using RPC function
      const { data: canAccess, error: accessError } = await supabase
        .rpc('user_belongs_to_company', { company_id: companyId });
      
      if (accessError) {
        console.warn('Error checking company access:', accessError);
      }
      
      // First get all user IDs associated with the company
      const { data: userCompanyRelations, error: relationError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', companyId);
        
      if (relationError) throw relationError;
      
      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        return [];
      }
      
      // Get user IDs
      const userIds = userCompanyRelations.map(relation => relation.user_id);
      
      // Get complete user profiles - using a separate query to avoid RLS issues
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email, cargo_id, is_admin, avatar')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      return profiles || [];
    } catch (error: any) {
      console.error('Error fetching company users:', error);
      toast.error(`Erro ao buscar usuários da empresa: ${error.message}`);
      return [];
    }
  }, []);
  
  const checkUserCompanyRelation = useCallback(async (userId: string, companyId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_empresa')
        .select('id')
        .eq('user_id', userId)
        .eq('empresa_id', companyId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking user-company relation:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Unexpected error checking user-company relation:', error);
      return false;
    }
  }, []);
  
  return {
    assignUserToCompany,
    removeUserFromCompany,
    getCompanyUsers,
    checkUserCompanyRelation
  };
};
