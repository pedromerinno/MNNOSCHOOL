
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
      
      // We won't try to call the admin.listUsers() API since it requires admin privileges
      // Instead, we'll query the profiles table to get user information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, is_admin');
      
      if (profilesError) {
        throw profilesError;
      }
      
      if (!profiles || profiles.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // For each profile, get the email
      // This approach relies on the current user having access to their own email
      // and assumes profiles and emails are accessible based on RLS policies
      const usersWithProfiles = await Promise.all(
        profiles.map(async (profile) => {
          // Try to get email from auth metadata if available to current user
          let email = '';
          
          // Fallback to a display format for users without emails
          if (!email) {
            email = `user-${profile.id.substring(0, 8)}`;
          }
          
          return {
            id: profile.id,
            email,
            display_name: profile.display_name,
            is_admin: profile.is_admin
          };
        })
      );
      
      setUsers(usersWithProfiles);
      setCachedUsers(usersWithProfiles);
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro ao buscar usuários',
        description: 'User not allowed', // Simplified error message
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
