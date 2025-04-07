
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setAdminStatusById } from '@/utils/adminUtils';

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  is_admin: boolean | null;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const getCachedUsers = (): UserProfile[] | null => {
    const cachedUsers = localStorage.getItem('cachedUsers');
    if (!cachedUsers) return null;
    
    try {
      const parsed = JSON.parse(cachedUsers);
      const now = new Date().getTime();
      if (parsed.expiry > now) {
        return parsed.data;
      }
      localStorage.removeItem('cachedUsers');
      return null;
    } catch (e) {
      console.error('Erro ao analisar usuários em cache', e);
      return null;
    }
  };
  
  const setCachedUsers = (data: UserProfile[]) => {
    try {
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
      const cachedData = getCachedUsers();
      if (cachedData) {
        console.log('Using cached users data while fetching updates');
        setUsers(cachedData);
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      // First, get the profiles with basic information
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, display_name, is_admin, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Map the profiles to our UserProfile interface
      let formattedUsers: UserProfile[] = profiles.map(profile => ({
        id: profile.id,
        email: null, // Will try to populate this in the next step
        display_name: profile.display_name || `User ${profile.id.substring(0, 6)}`,
        is_admin: profile.is_admin
      }));
      
      // Attempt to get emails from the auth.users table
      // This is a workaround as direct joins might have permission issues
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Use the REST API to directly fetch the relationship between profiles and user emails
          const response = await fetch(
            'https://gswvicwtswokyfbgoxps.supabase.co/rest/v1/profiles?select=id,email:auth.users(email)',
            {
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd3ZpY3d0c3dva3lmYmdveHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MDQ4MTksImV4cCI6MjA1OTQ4MDgxOX0.kyN2Qq3v9H_ENVzSH4QfGwUJLCVEXIo44-MQImFQ_Z0',
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.ok) {
            const userData = await response.json();
            
            // Update our formatted users with email data if available
            formattedUsers = formattedUsers.map(user => {
              const matchingUserData = userData.find((item: any) => item.id === user.id);
              if (matchingUserData && 
                  matchingUserData.email && 
                  Array.isArray(matchingUserData.email) && 
                  matchingUserData.email.length > 0 && 
                  matchingUserData.email[0].email) {
                return { ...user, email: matchingUserData.email[0].email };
              }
              return user;
            });
          }
        }
      } catch (emailError) {
        console.warn('Unable to fetch user emails, using display names only:', emailError);
      }
      
      setUsers(formattedUsers);
      setCachedUsers(formattedUsers);
      setLoading(false);
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro ao buscar usuários',
        description: error.message || 'Ocorreu um erro ao buscar os usuários',
        variant: 'destructive',
      });
      
      const cachedData = getCachedUsers();
      if (cachedData) {
        console.log('Using cached users data due to error');
        setUsers(cachedData);
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

  return { users, loading, fetchUsers, toggleAdminStatus };
}
