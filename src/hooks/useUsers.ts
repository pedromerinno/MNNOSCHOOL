
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
  is_admin: boolean | null;
  super_admin?: boolean | null;
  avatar?: string | null;
  cargo_id?: string | null;
  created_at?: string | null;
  // Novas colunas adicionadas
  aniversario?: string | null;
  tipo_contrato?: 'CLT' | 'PJ' | 'Fornecedor' | null;
  cidade?: string | null;
  data_inicio?: string | null;
  manual_cultura_aceito?: boolean | null;
  nivel_colaborador?: 'Junior' | 'Pleno' | 'Senior' | null;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { setCache, getCache, clearCache } = useOptimizedCache();
  const { selectedCompany } = useCompanies();
  
  const USERS_CACHE_KEY = 'users';
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
        is_admin: user.is_admin,
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

  // Helper function otimizada para buscar IDs das empresas do usuário
  const getUserCompanyIds = useCallback(async (userId: string): Promise<string[]> => {
    try {
      const { data: userCompanies } = await supabase
        .from('user_empresa')
        .select('empresa_id')
        .eq('user_id', userId)
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
      
      // Buscar perfil do usuário atual primeiro
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', currentUserId)
        .single();
        
      if (profileError) {
        console.error('[useUsers] Error fetching user profile:', profileError);
        throw profileError;
      }
        
      if (currentUserProfile?.super_admin) {
        console.log('[useUsers] Fetching all users for super admin');
        // Super admin vê todos os usuários - com limite para performance
        const { data: allUsers, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            display_name, 
            is_admin, 
            super_admin, 
            email, 
            created_at,
            aniversario,
            tipo_contrato,
            cidade,
            data_inicio,
            manual_cultura_aceito,
            nivel_colaborador
          `)
          .order('display_name', { ascending: true })
          .limit(50); // Limitar para evitar sobrecarga
          
        if (error) {
          console.error('[useUsers] Error fetching all users:', error);
          throw error;
        }
        
        if (allUsers) {
          console.log('[useUsers] Fetched', allUsers.length, 'users for super admin');
          setUsers(allUsers);
          setCachedUsers(allUsers);
        }
      } else if (currentUserProfile?.is_admin) {
        console.log('[useUsers] Fetching company users for admin');
        // Admin vê apenas usuários das suas empresas
        const companyIds = await getUserCompanyIds(currentUserId);
        
        if (companyIds.length === 0) {
          console.log('[useUsers] No companies found for admin user');
          setUsers([]);
          return;
        }
        
        const { data: companyUsers, error } = await supabase
          .from('user_empresa')
          .select(`
            user_id,
            profiles!inner(
              id, 
              display_name, 
              is_admin, 
              super_admin, 
              email, 
              created_at,
              aniversario,
              tipo_contrato,
              cidade,
              data_inicio,
              manual_cultura_aceito,
              nivel_colaborador
            )
          `)
          .in('empresa_id', companyIds)
          .limit(100); // Limitar para performance
          
        if (error) {
          console.error('[useUsers] Error fetching company users:', error);
          throw error;
        }
        
        // Extrair usuários únicos do resultado
        const uniqueUsers = companyUsers?.reduce((acc: UserProfile[], item: any) => {
          const user = item.profiles;
          if (user && !acc.find(u => u.id === user.id)) {
            acc.push(user);
          }
          return acc;
        }, []) || [];
        
        console.log('[useUsers] Fetched', uniqueUsers.length, 'company users for admin');
        setUsers(uniqueUsers);
        setCachedUsers(uniqueUsers);
      } else {
        console.log('[useUsers] Regular user - no access to user list');
        setUsers([]);
      }
      
    } catch (error: any) {
      console.error('[useUsers] Error fetching fresh users:', error);
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  }, [getUserCompanyIds, setCachedUsers]);

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

  useEffect(() => {
    console.log('[useUsers] Component mounted, starting fetch...');
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, fetchUsers, toggleAdminStatus };
}
