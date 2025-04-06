
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First fetch auth users to get emails
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }
      
      // Ensure users array exists in the response
      if (!authData || !authData.users) {
        throw new Error('Failed to fetch users');
      }
      
      // Now fetch profiles to get admin status
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, is_admin');
        
      if (profilesError) {
        throw profilesError;
      }
      
      // Merge the data - make sure we're accessing properties correctly
      const mergedUsers = authData.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id);
        return {
          id: user.id,
          email: user.email || '',
          display_name: profile?.display_name || (user.email ? user.email.split('@')[0] : ''),
          is_admin: profile?.is_admin || false
        };
      });
      
      setUsers(mergedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro ao buscar usuários',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentStatus } 
          : user
      ));
      
      toast({
        title: 'Sucesso',
        description: `Usuário ${currentStatus ? 'removido da' : 'adicionado à'} lista de administradores.`,
      });
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, fetchUsers, toggleAdminStatus };
}
