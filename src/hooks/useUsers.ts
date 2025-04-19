import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setAdminStatusById } from '@/utils/adminUtils';

export interface UserProfile {
  id?: string; // Make id optional to handle missing id cases
  email: string | null;
  display_name: string | null;
  is_admin: boolean | null;
  avatar?: string | null;
  cargo?: string | null;
  cargo_id?: string | null;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const getCachedUsers = (): UserProfile[] | null => {
    try {
      const cachedUsers = localStorage.getItem('cachedUsers');
      if (!cachedUsers) return null;
      
      const parsed = JSON.parse(cachedUsers);
      const now = new Date().getTime();
      if (parsed.expiry > now) {
        return parsed.data;
      }
      localStorage.removeItem('cachedUsers');
      return null;
    } catch (e) {
      console.error('Error parsing cached users', e);
      return null;
    }
  };
  
  const setCachedUsers = (data: UserProfile[]) => {
    try {
      const usersToCache = data.slice(0, 5);
      const expiry = new Date().getTime() + (15 * 60 * 1000); // 15 minutes
      
      try {
        localStorage.setItem('cachedUsers', JSON.stringify({
          data: usersToCache,
          expiry
        }));
      } catch (storageError) {
        console.warn('Storage quota exceeded, clearing cache');
        localStorage.removeItem('cachedUsers');
      }
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
      
      const { data: isAdminResult, error: isAdminError } = await supabase.rpc('is_admin');
      
      if (isAdminError) {
        console.warn('Error checking if user is admin:', isAdminError);
      }
      
      const isAdmin = !!isAdminResult;
      console.log('Current user is admin:', isAdmin);
      
      const result = await supabase
        .from('profiles')
        .select('id, display_name, is_admin, email, created_at, avatar, cargo, cargo_id');
        
      if (result.error) {
        console.error('Error fetching profiles:', result.error);
        throw result.error;
      }

      const formattedUsers: UserProfile[] = result.data.map((profile: any) => ({
        id: profile.id,
        email: profile.email || profile.id.toLowerCase() + '@example.com',
        display_name: profile.display_name || `User ${profile.id.substring(0, 6)}`,
        is_admin: profile.is_admin,
        avatar: profile.avatar,
        cargo: profile.cargo,
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
            cargo: 'Administrador',
            cargo_id: 'mock-admin-role'
          }
        ];
        setUsers(mockUsers);
      }
      setLoading(false);
    }
  }, [toast]);

  const toggleAdminStatus = useCallback(async (userId: string, currentStatus: boolean | null) => {
    try {
      await setAdminStatusById(userId, !(currentStatus || false));
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !(currentStatus || false) } 
          : user
      ));
      
      const cachedData = getCachedUsers();
      if (cachedData) {
        const updatedCache = cachedData.map(user => 
          user.id === userId 
            ? { ...user, is_admin: !(currentStatus || false) } 
            : user
        );
        setCachedUsers(updatedCache);
      }
      
      toast({
        title: 'Sucesso',
        description: `Status de administrador atualizado com sucesso.`,
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
