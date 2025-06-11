
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
  const USERS_CACHE_EXPIRATION = 15;
  
  const getCachedUsers = useCallback((): UserProfile[] | null => {
    return getCache<UserProfile[]>({
      key: USERS_CACHE_KEY,
      expirationMinutes: USERS_CACHE_EXPIRATION
    });
  }, [getCache]);
  
  const setCachedUsers = useCallback((data: UserProfile[]) => {
    try {
      const usersToCache = data.slice(0, 20); // Aumentei o limite de cache
      setCache({
        key: USERS_CACHE_KEY,
        expirationMinutes: USERS_CACHE_EXPIRATION
      }, usersToCache);
    } catch (e) {
      console.error('Error caching users', e);
    }
  }, [setCache]);

  const fetchUsers = useCallback(async () => {
    try {
      // Use cached data immediately if available
      const cachedData = getCachedUsers();
      if (cachedData) {
        console.log('Using cached users data');
        setUsers(cachedData);
        setLoading(false);
        // Still fetch fresh data in background
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('No user is currently logged in');
      }
      
      // Get current user profile first
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', currentUserId)
        .single();
        
      if (currentUserProfile?.super_admin) {
        // Super admin sees all users - optimized query
        const { data: allUsers, error } = await supabase
          .from('profiles')
          .select('id, display_name, is_admin, super_admin, email, created_at, avatar, cargo_id')
          .order('display_name', { ascending: true })
          .limit(100); // Limit results for performance
          
        if (error) throw error;
        
        if (allUsers) {
          setUsers(allUsers);
          setCachedUsers(allUsers);
        }
      } else if (currentUserProfile?.is_admin) {
        // Admin sees only users from their companies - single optimized query
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
          .in('empresa_id', await getUserCompanyIds(currentUserId));
          
        if (error) throw error;
        
        // Extract unique users from the join result
        const uniqueUsers = companyUsers?.reduce((acc: UserProfile[], item: any) => {
          const user = item.profiles;
          if (user && !acc.find(u => u.id === user.id)) {
            acc.push(user);
          }
          return acc;
        }, []) || [];
        
        setUsers(uniqueUsers);
        setCachedUsers(uniqueUsers);
      }
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      // Use cached data on error if available
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
  }, [toast, getCachedUsers, setCachedUsers]);

  // Helper function to get user company IDs efficiently
  const getUserCompanyIds = useCallback(async (userId: string): Promise<string[]> => {
    const { data: userCompanies } = await supabase
      .from('user_empresa')
      .select('empresa_id')
      .eq('user_id', userId);
      
    return userCompanies?.map(uc => uc.empresa_id) || [];
  }, []);

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
      
      // Update cache
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
