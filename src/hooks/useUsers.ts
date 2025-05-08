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
  
  const getCachedUsers = (): UserProfile[] | null => {
    return getCache<UserProfile[]>({
      key: USERS_CACHE_KEY,
      expirationMinutes: USERS_CACHE_EXPIRATION
    });
  };
  
  const setCachedUsers = (data: UserProfile[]) => {
    try {
      const usersToCache = data.slice(0, 5);
      setCache({
        key: USERS_CACHE_KEY,
        expirationMinutes: USERS_CACHE_EXPIRATION
      }, usersToCache);
    } catch (e) {
      console.error('Error caching users', e);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const cachedData = getCachedUsers();
      if (cachedData) {
        console.log('Using cached users data while fetching updates');
        setUsers(cachedData);
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('No user is currently logged in');
      }
      
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', currentUserId)
        .single();
        
      if (currentUserProfile?.super_admin) {
        const result = await supabase
          .from('profiles')
          .select('id, display_name, is_admin, super_admin, email, created_at, avatar, cargo_id');
          
        if (result.error) throw result.error;
        setUsers(result.data);
      } else if (currentUserProfile?.is_admin) {
        const { data: userCompanies } = await supabase
          .from('user_empresa')
          .select('empresa_id')
          .eq('user_id', currentUserId);
          
        if (!userCompanies?.length) {
          setUsers([]);
          return;
        }
        
        const companyIds = userCompanies.map(uc => uc.empresa_id);
        
        const { data: companyUsers } = await supabase
          .from('user_empresa')
          .select('user_id')
          .in('empresa_id', companyIds);
          
        if (!companyUsers?.length) {
          setUsers([]);
          return;
        }
        
        const userIds = [...new Set(companyUsers.map(cu => cu.user_id))];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, is_admin, super_admin, email, created_at, avatar, cargo_id')
          .in('id', userIds);
          
        if (profiles) {
          setUsers(profiles);
        }
      }
      
      setLoading(false);
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      if (!error.message?.includes('política de segurança') && 
          !error.message?.includes('Erro de permissão')) {
        toast({
          title: 'Erro ao buscar usuários',
          description: error.message || 'Ocorreu um erro ao buscar os usuários',
          variant: 'destructive',
        });
      }
      
      const cachedData = getCachedUsers();
      if (cachedData) {
        console.log('Using cached users data due to error');
        setUsers(cachedData);
      }
      setLoading(false);
    }
  }, [toast]);

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
      
      const cachedData = getCachedUsers();
      if (cachedData) {
        const updatedCache = cachedData.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                [isSuperAdmin ? 'super_admin' : 'is_admin']: !(currentStatus || false)
              } 
            : user
        );
        setCachedUsers(updatedCache);
      }
      
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
  }, [users, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, fetchUsers, toggleAdminStatus };
}
