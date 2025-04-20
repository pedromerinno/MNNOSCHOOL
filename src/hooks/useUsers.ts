
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setAdminStatusById, checkIfUserIsAdmin, checkIfUserIsSuperAdmin } from '@/utils/adminUtils';
import { useCache } from '@/hooks/useCache';

export interface UserProfile {
  id: string; 
  email: string | null;
  display_name: string | null;
  is_admin: boolean | null;
  super_admin?: boolean | null;
  avatar?: string | null;
  cargo_id?: string | null;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { setCache, getCache, clearCache } = useCache();
  
  const USERS_CACHE_KEY = 'cachedUsers';
  const USERS_CACHE_EXPIRATION = 15; // 15 minutes
  
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
      
      // Use our new secure functions to check admin status
      const isAdmin = await checkIfUserIsAdmin(currentUserId);
      const isSuperAdmin = await checkIfUserIsSuperAdmin(currentUserId);
      
      console.log('Current user is admin:', isAdmin, 'and super admin:', isSuperAdmin);
      
      // Handle potential infinite recursion by using direct query if user is admin
      let profiles = [];
      if (isAdmin || isSuperAdmin) {
        const result = await supabase
          .from('profiles')
          .select('id, display_name, is_admin, super_admin, email, created_at, avatar, cargo_id');
          
        if (result.error) {
          console.error('Error fetching profiles:', result.error);
          throw result.error;
        }
        
        profiles = result.data;
      } else {
        // For non-admin users, just get their own profile
        const result = await supabase
          .from('profiles')
          .select('id, display_name, is_admin, super_admin, email, created_at, avatar, cargo_id')
          .eq('id', currentUserId);
          
        if (result.error) {
          console.error('Error fetching own profile:', result.error);
          throw result.error;
        }
        
        profiles = result.data;
      }

      const formattedUsers: UserProfile[] = profiles.map((profile: any) => ({
        id: profile.id,
        email: profile.email || profile.id.toLowerCase() + '@example.com',
        display_name: profile.display_name || `User ${profile.id.substring(0, 6)}`,
        is_admin: profile.is_admin,
        super_admin: profile.super_admin,
        avatar: profile.avatar,
        cargo_id: profile.cargo_id
      }));
      
      setUsers(formattedUsers);
      setCachedUsers(formattedUsers);
      setLoading(false);
      
      console.log('Users fetched successfully:', formattedUsers.length);
      
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
      } else {
        console.log('No cached data, creating mock data');
        const mockUsers: UserProfile[] = [
          {
            id: 'current-user',
            email: 'admin@example.com',
            display_name: 'Admin (Offline Mode)',
            is_admin: true,
            super_admin: true,
            cargo_id: 'mock-admin-role'
          }
        ];
        setUsers(mockUsers);
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
