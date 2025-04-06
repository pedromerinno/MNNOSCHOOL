
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setAdminStatusById } from '@/utils/adminUtils';
import { retryWithTimeout } from './company/utils/retryUtils';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean | null;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Improved cache for user data
  const getCachedUsers = (): UserProfile[] | null => {
    const cachedUsers = localStorage.getItem('cachedUsers');
    if (!cachedUsers) return null;
    
    try {
      const parsed = JSON.parse(cachedUsers);
      const now = new Date().getTime();
      // Cache valid for 15 minutes instead of 30 for more frequent updates
      if (parsed.expiry > now) {
        return parsed.data;
      }
      // Cache expired
      localStorage.removeItem('cachedUsers');
      return null;
    } catch (e) {
      console.error('Erro ao analisar usuários em cache', e);
      return null;
    }
  };
  
  const setCachedUsers = (data: UserProfile[]) => {
    try {
      // Cache for 15 minutes instead of 30
      const expiry = new Date().getTime() + (15 * 60 * 1000);
      localStorage.setItem('cachedUsers', JSON.stringify({
        data,
        expiry
      }));
    } catch (e) {
      console.error('Erro ao armazenar usuários em cache', e);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      // First check cache and update UI immediately if available
      const cachedData = getCachedUsers();
      if (cachedData) {
        console.log('Using cached users data while fetching updates');
        setUsers(cachedData);
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      // Fetch users and profiles in parallel with retries and timeout
      const fetchAuthUsers = async () => {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        return (data as any).users || [];
      };
      
      const fetchProfiles = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, is_admin');
        if (error) throw error;
        return data || [];
      };
      
      // Use Promise.all with retryWithTimeout for both requests
      const [authUsers, profiles] = await Promise.all([
        retryWithTimeout(fetchAuthUsers, 2, 500, 7000),
        retryWithTimeout(fetchProfiles, 2, 500, 7000)
      ]);
      
      if (!authUsers.length) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Merge the data more efficiently
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      
      const mergedUsers = authUsers.map((user: any) => {
        const profile = profileMap.get(user.id);
        return {
          id: user.id,
          email: user.email || '',
          display_name: profile?.display_name || (user.email ? user.email.split('@')[0] : ''),
          is_admin: profile?.is_admin || false
        };
      });
      
      setUsers(mergedUsers);
      setCachedUsers(mergedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro ao buscar usuários',
        description: error.message,
        variant: 'destructive',
      });
      
      // Use cached data in case of error
      const cachedData = getCachedUsers();
      if (cachedData) {
        console.log('Using cached users data due to error');
        setUsers(cachedData);
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const toggleAdminStatus = useCallback(async (userId: string, currentStatus: boolean | null) => {
    try {
      await setAdminStatusById(userId, !(currentStatus || false));
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !(currentStatus || false) } 
          : user
      ));
      
      // Update cache too
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
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [users, toast]);

  // Initial fetch with useEffect
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, fetchUsers, toggleAdminStatus };
}
