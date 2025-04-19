
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/hooks/useUsers";

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
      
      // Get current user to verify if is admin
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', (await supabase.auth.getSession()).data.session?.user?.id)
        .single();
        
      if (profileError) {
        console.error('Error checking admin status:', profileError);
        toast.error("Erro ao verificar permissões de administrador");
        return false;
      }
      
      if (!currentUserProfile?.is_admin) {
        toast.error("Apenas administradores podem associar usuários a empresas");
        return false;
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
      // Get current user to verify if is admin
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', (await supabase.auth.getSession()).data.session?.user?.id)
        .single();
        
      if (profileError) {
        console.error('Error checking admin status:', profileError);
        toast.error("Erro ao verificar permissões de administrador");
        return false;
      }
      
      if (!currentUserProfile?.is_admin) {
        toast.error("Apenas administradores podem remover usuários de empresas");
        return false;
      }
      
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
  
  /**
   * Get all users associated with a company
   */
  const getCompanyUsers = useCallback(async (companyId: string): Promise<UserProfile[]> => {
    try {
      // Verificar se o usuário atual é administrador
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', (await supabase.auth.getSession()).data.session?.user?.id)
        .single();
        
      if (profileError) {
        console.warn('Error checking admin status:', profileError);
        // Continuar tentando buscar os usuários
      }
      
      // Buscar todos os usuários associados à empresa através da tabela user_empresa
      const { data: userCompanyRelations, error: relationError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', companyId);
        
      if (relationError) throw relationError;
      
      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        return [];
      }
      
      // Pegar os IDs dos usuários
      const userIds = userCompanyRelations.map(relation => relation.user_id);
      
      // Buscar os perfis completos dos usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email, cargo_id, cargo, is_admin')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      return profiles || [];
    } catch (error: any) {
      console.error('Error fetching company users:', error);
      toast.error(`Erro ao buscar usuários da empresa: ${error.message}`);
      return [];
    }
  }, []);
  
  /**
   * Check if a user belongs to a company
   */
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
