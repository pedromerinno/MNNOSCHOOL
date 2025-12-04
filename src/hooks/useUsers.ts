
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setAdminStatusById } from '@/utils/adminUtils';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { useCompanies } from '@/hooks/company';

export interface UserProfile {
  id: string; 
  email: string | null;
  display_name: string | null;
  super_admin?: boolean | null; // Global - acesso a tudo
  avatar?: string | null;
  created_at?: string | null;
  // Dados pessoais globais
  aniversario?: string | null;
  cidade?: string | null;
  // Campos da empresa (vindos de user_empresa via get_company_users):
  is_admin?: boolean | null; // Admin desta empresa específica
  cargo_id?: string | null;
  cargo_title?: string | null;
  tipo_contrato?: string | null;
  data_inicio?: string | null;
  manual_cultura_aceito?: boolean | null;
  nivel_colaborador?: string | null;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { setCache, getCache, clearCache } = useOptimizedCache();
  const { selectedCompany, userCompanies, isLoading: companiesLoading } = useCompanies();
  
  const USERS_CACHE_KEY = `users_${selectedCompany?.id || 'all'}`;
  const USERS_CACHE_EXPIRATION = 5; // Reduzido para 5 minutos
  
  const getCachedUsers = useCallback((): UserProfile[] | null => {
    try {
      return getCache<UserProfile[]>(USERS_CACHE_KEY);
    } catch (error) {
      console.warn('Error getting cached users:', error);
      clearCache(USERS_CACHE_KEY);
      return null;
    }
  }, [getCache, clearCache]);
  
  const setCachedUsers = useCallback((data: UserProfile[]) => {
    try {
      // Criar uma versão simplificada dos dados para cache (sem propriedades desnecessárias)
      const simplifiedUsers = data.slice(0, 20).map(user => ({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        // is_admin foi removido de profiles - agora está em user_empresa
        super_admin: user.super_admin
      }));
      
      setCache(USERS_CACHE_KEY, simplifiedUsers, USERS_CACHE_EXPIRATION);
      console.log('[useUsers] Users cached successfully');
    } catch (error) {
      console.warn('[useUsers] Error caching users:', error);
      // Limpar cache se falhar
      clearCache(USERS_CACHE_KEY);
    }
  }, [setCache, clearCache]);

  // Helper function otimizada para buscar IDs das empresas onde o usuário é admin
  const getUserCompanyIds = useCallback(async (userId: string): Promise<string[]> => {
    try {
      const { data: userCompanies } = await supabase
        .from('user_empresa')
        .select('empresa_id')
        .eq('user_id', userId)
        .eq('is_admin', true) // Apenas empresas onde é admin
        .limit(50); // Limitar para evitar queries muito grandes
        
      return userCompanies?.map(uc => uc.empresa_id) || [];
    } catch (error) {
      console.error('[useUsers] Error getting user company IDs:', error);
      return [];
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      console.log('[useUsers] Starting to fetch users...');
      
      // Tentar usar dados do cache primeiro
      const cachedData = getCachedUsers();
      if (cachedData && cachedData.length > 0) {
        console.log('[useUsers] Using cached users data:', cachedData.length);
        setUsers(cachedData);
        setLoading(false);
        
        // Fazer fetch em background para atualizar cache
        setTimeout(() => {
          fetchFreshUsers();
        }, 1000);
        return;
      }
      
      await fetchFreshUsers();
      
    } catch (error: any) {
      console.error('[useUsers] Error in fetchUsers:', error);
      handleFetchError(error);
    }
  }, [getCachedUsers]);

  const fetchFreshUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('No user is currently logged in');
      }
      
      console.log('[useUsers] Fetching fresh user data for:', currentUserId);
      
      // Query otimizada: buscar perfil do usuário atual e verificar se é super_admin
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('super_admin')
        .eq('id', currentUserId)
        .single();
        
      if (profileError) {
        console.error('[useUsers] Error fetching user profile:', profileError);
        throw profileError;
      }
      
      const isSuperAdmin = currentUserProfile?.super_admin === true;
      
      // Se não há empresa selecionada, aguardar um pouco para ver se será selecionada
      if (!selectedCompany?.id) {
        // Se ainda está carregando empresas, manter loading e aguardar
        if (companiesLoading) {
          console.log('[useUsers] Companies still loading, waiting...');
          // Não definir loading como false aqui, manter true para mostrar loading
          return;
        }
        
        // Se há empresas disponíveis mas nenhuma selecionada, aguardar seleção automática
        if (userCompanies && userCompanies.length > 0) {
          console.log('[useUsers] No company selected but companies available, waiting for auto-selection...');
          // A empresa será selecionada automaticamente pelo useCompanies, aguardar
          // Manter loading para não mostrar empty state prematuramente
          return;
        }
        
        // Se é super admin e não há empresa selecionada, aguardar seleção
        if (isSuperAdmin) {
          console.log('[useUsers] Super admin but no company selected yet, waiting for selection...');
          // Manter loading
          return;
        }
        
        // Caso contrário, não há empresas e não há empresa selecionada
        console.log('[useUsers] No company selected and no companies available, showing empty list');
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Query otimizada usando função helper que usa view pré-processada
      // Muito mais rápida que múltiplas queries
      console.log('[useUsers] Calling get_company_users RPC with company ID:', selectedCompany.id);
      console.log('[useUsers] Current user ID:', currentUserId);
      console.log('[useUsers] Is super admin:', isSuperAdmin);
      
      const { data: userProfiles, error: profilesError } = await supabase
        .rpc('get_company_users', { _empresa_id: selectedCompany.id });
      
      if (profilesError) {
        console.error('[useUsers] Error fetching user profiles:', profilesError);
        console.error('[useUsers] Error details:', {
          message: profilesError.message,
          details: profilesError.details,
          hint: profilesError.hint,
          code: profilesError.code
        });
        throw profilesError;
      }
      
      console.log('[useUsers] RPC response:', {
        hasData: !!userProfiles,
        dataLength: userProfiles?.length || 0,
        companyId: selectedCompany.id,
        companyName: selectedCompany.nome,
        rawData: userProfiles
      });
      
      if (userProfiles && userProfiles.length > 0) {
        console.log('[useUsers] Fetched', userProfiles.length, 'users via optimized view');
        // Mapear dados da view para UserProfile
        const typedUsers: UserProfile[] = userProfiles.map((user: any) => ({
          id: user.id,
          display_name: user.display_name,
          email: user.email,
          avatar: user.avatar,
          super_admin: user.super_admin,
          created_at: user.created_at,
          aniversario: user.aniversario,
          cidade: user.cidade,
          // Campos da empresa
          is_admin: user.is_admin,
          cargo_id: user.cargo_id,
          cargo_title: user.cargo_title,
          tipo_contrato: user.tipo_contrato,
          data_inicio: user.data_inicio,
          manual_cultura_aceito: user.manual_cultura_aceito,
          nivel_colaborador: user.nivel_colaborador
        }));
        
        console.log('[useUsers] Setting users:', typedUsers.length);
        setUsers(typedUsers);
        setCachedUsers(typedUsers);
      } else {
        console.warn('[useUsers] No user profiles found for company:', {
          companyId: selectedCompany.id,
          companyName: selectedCompany.nome,
          currentUserId,
          isSuperAdmin,
          note: 'This could mean: 1) No users are linked to this company, 2) Permission issue, or 3) RPC function returned empty'
        });
        setUsers([]);
      }
      
    } catch (error: any) {
      console.error('[useUsers] Error fetching fresh users:', error);
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?.id, setCachedUsers, companiesLoading, userCompanies]);

  const handleFetchError = useCallback((error: any) => {
    // Tentar usar dados do cache em caso de erro
    const cachedData = getCachedUsers();
    if (cachedData && cachedData.length > 0) {
      console.log('[useUsers] Using cached data due to error');
      setUsers(cachedData);
    } else {
      console.error('[useUsers] No cached data available, showing error');
      
      if (!error.message?.includes('política de segurança') && 
          !error.message?.includes('Erro de permissão')) {
        toast({
          title: 'Erro ao buscar usuários',
          description: error.message || 'Ocorreu um erro ao buscar os usuários',
          variant: 'destructive',
        });
      }
    }
    setLoading(false);
  }, [getCachedUsers, toast]);

  const toggleAdminStatus = useCallback(async (
    userId: string, 
    currentStatus: boolean | null, 
    isSuperAdmin: boolean = false
  ) => {
    try {
      console.log('[useUsers] Toggling admin status for user:', userId);
      
      await setAdminStatusById(userId, !(currentStatus || false), isSuperAdmin);
      
      // Atualizar estado local
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              [isSuperAdmin ? 'super_admin' : 'is_admin']: !(currentStatus || false)
            } 
          : user
      );
      
      setUsers(updatedUsers);
      setCachedUsers(updatedUsers);
      
      toast({
        title: 'Sucesso',
        description: `Status de ${isSuperAdmin ? 'super admin' : 'admin'} atualizado com sucesso.`,
      });
    } catch (error: any) {
      console.error('[useUsers] Error toggling admin status:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao atualizar o status de administrador',
        variant: 'destructive',
      });
    }
  }, [users, toast, setCachedUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      console.log('[useUsers] Deleting user:', userId);
      
      const { error } = await supabase.rpc('delete_user_safely', {
        target_user_id: userId
      });
      
      if (error) {
        throw error;
      }
      
      // Atualizar estado local removendo o usuário
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      setCachedUsers(updatedUsers);
      
      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso.',
      });
    } catch (error: any) {
      console.error('[useUsers] Error deleting user:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao excluir o usuário',
        variant: 'destructive',
      });
    }
  }, [users, toast, setCachedUsers]);

  useEffect(() => {
    console.log('[useUsers] Component mounted or company changed, starting fetch...', {
      selectedCompanyId: selectedCompany?.id,
      selectedCompanyName: selectedCompany?.nome,
      companiesLoading,
      userCompaniesCount: userCompanies?.length,
      userCompaniesNames: userCompanies?.map(c => c.nome)
    });
    
    // Se empresas estão carregando, aguardar um pouco antes de tentar buscar
    if (companiesLoading) {
      console.log('[useUsers] Companies loading, will retry when loaded');
      const timeout = setTimeout(() => {
        console.log('[useUsers] Retrying after companies load timeout');
        fetchUsers();
      }, 1000);
      return () => clearTimeout(timeout);
    }
    
    // Se há empresas mas nenhuma selecionada, aguardar um pouco para seleção automática
    if (!selectedCompany?.id && userCompanies && userCompanies.length > 0) {
      console.log('[useUsers] Waiting for company auto-selection...', {
        availableCompanies: userCompanies.map(c => ({ id: c.id, nome: c.nome }))
      });
      const timeout = setTimeout(() => {
        console.log('[useUsers] Retrying after auto-selection timeout');
        fetchUsers();
      }, 2000);
      return () => clearTimeout(timeout);
    }
    
    // Se não há empresa selecionada e não há empresas, não há o que fazer
    if (!selectedCompany?.id && (!userCompanies || userCompanies.length === 0)) {
      console.log('[useUsers] No company selected and no companies available');
      return;
    }
    
    console.log('[useUsers] Calling fetchUsers with company:', selectedCompany?.id);
    fetchUsers();
  }, [fetchUsers, selectedCompany?.id, companiesLoading, userCompanies?.length]);

  return { users, loading, fetchUsers, toggleAdminStatus, deleteUser };
}
