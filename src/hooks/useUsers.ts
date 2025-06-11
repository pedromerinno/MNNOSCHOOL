
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setAdminStatusById } from '@/utils/adminUtils';
import { useCache } from '@/hooks/useCache';
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
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { setCache, getCache, clearCache } = useCache();
  const { selectedCompany } = useCompanies();
  
  const USERS_CACHE_KEY = 'cachedUsers';
  const USERS_CACHE_EXPIRATION = 10; // Reduzido para 10 minutos
  
  const getCachedUsers = useCallback((): UserProfile[] | null => {
    return getCache<UserProfile[]>({
      key: USERS_CACHE_KEY,
      expirationMinutes: USERS_CACHE_EXPIRATION
    });
  }, [getCache]);
  
  const setCachedUsers = useCallback((data: UserProfile[]) => {
    try {
      const usersToCache = data.slice(0, 50); // Limitar cache a 50 usuários
      setCache({
        key: USERS_CACHE_KEY,
        expirationMinutes: USERS_CACHE_EXPIRATION
      }, usersToCache);
    } catch (e) {
      console.error('Error caching users', e);
    }
  }, [setCache]);

  // Helper function otimizada para buscar IDs das empresas do usuário
  const getUserCompanyIds = useCallback(async (userId: string): Promise<string[]> => {
    const { data: userCompanies } = await supabase
      .from('user_empresa')
      .select('empresa_id')
      .eq('user_id', userId);
      
    return userCompanies?.map(uc => uc.empresa_id) || [];
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      // Usar dados do cache imediatamente se disponível
      const cachedData = getCachedUsers();
      if (cachedData) {
        console.log('Using cached users data');
        setUsers(cachedData);
        setLoading(false);
        return; // Não buscar dados frescos se temos cache válido
      }
      
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('No user is currently logged in');
      }
      
      // Buscar perfil do usuário atual primeiro - otimizado
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', currentUserId)
        .single();
        
      if (currentUserProfile?.super_admin) {
        // Super admin vê todos os usuários - query otimizada
        const { data: allUsers, error } = await supabase
          .from('profiles')
          .select('id, display_name, is_admin, super_admin, email, created_at, avatar, cargo_id')
          .order('display_name', { ascending: true })
          .limit(100); // Limitar resultados para performance
          
        if (error) throw error;
        
        if (allUsers) {
          setUsers(allUsers);
          setCachedUsers(allUsers);
        }
      } else if (currentUserProfile?.is_admin) {
        // Admin vê apenas usuários das suas empresas - query única otimizada
        const companyIds = await getUserCompanyIds(currentUserId);
        
        if (companyIds.length === 0) {
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
              avatar, 
              cargo_id
            )
          `)
          .in('empresa_id', companyIds);
          
        if (error) throw error;
        
        // Extrair usuários únicos do resultado do join
        const uniqueUsers = companyUsers?.reduce((acc: UserProfile[], item: any) => {
          const user = item.profiles;
          if (user && !acc.find(u => u.id === user.id)) {
            acc.push(user);
          }
          return acc;
        }, []) || [];
        
        setUsers(uniqueUsers);
        setCachedUsers(uniqueUsers);
      } else {
        // Usuários comuns não podem ver outros usuários
        setUsers([]);
      }
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      // Usar dados do cache em caso de erro se disponível
      const cachedData = getCachedUsers();
      if (cachedData) {
        console.log('Using cached users data due to error');
        setUsers(cachedData);
      } else if (!error.message?.includes('política de segurança') && 
          !error.message?.includes('Erro de permissão')) {
        toast({
          title: 'Erro ao buscar usuários',
          description: error.message || 'Ocorreu um erro ao buscar os usuários',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast, getCachedUsers, setCachedUsers, getUserCompanyIds]);

  const toggleAdminStatus = useCallback(async (
    userId: string, 
    currentStatus: boolean | null, 
    isSuperAdmin: boolean = false
  ) => {
    try {
      await setAdminStatusById(userId, !(currentStatus || false), isSuperAdmin);
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              [isSuperAdmin ? 'super_admin' : 'is_admin']: !(currentStatus || false)
            } 
          : user
      ));
      
      // Atualizar cache
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              [isSuperAdmin ? 'super_admin' : 'is_admin']: !(currentStatus || false)
            } 
          : user
      );
      setCachedUsers(updatedUsers);
      
      toast({
        title: 'Sucesso',
        description: `Status de ${isSuperAdmin ? 'super admin' : 'admin'} atualizado com sucesso.`,
      });
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao atualizar o status de administrador',
        variant: 'destructive',
      });
    }
  }, [users, toast, setCachedUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, fetchUsers, toggleAdminStatus };
}
