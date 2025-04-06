
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setAdminStatusById } from '@/utils/adminUtils';

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
  
  // Adicionar cache para os dados de usuários
  const getCachedUsers = (): UserProfile[] | null => {
    const cachedUsers = localStorage.getItem('cachedUsers');
    if (!cachedUsers) return null;
    
    try {
      const parsed = JSON.parse(cachedUsers);
      const now = new Date().getTime();
      // Verificar se o cache não expirou (30 minutos)
      if (parsed.expiry > now) {
        return parsed.data;
      }
      // Cache expirado
      localStorage.removeItem('cachedUsers');
      return null;
    } catch (e) {
      console.error('Erro ao analisar usuários em cache', e);
      return null;
    }
  };
  
  const setCachedUsers = (data: UserProfile[]) => {
    try {
      // Cache por 30 minutos
      const expiry = new Date().getTime() + (30 * 60 * 1000);
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
      // Verificar cache primeiro
      const cachedData = getCachedUsers();
      if (cachedData) {
        setUsers(cachedData);
        setLoading(false);
        console.log('Usando usuários em cache enquanto busca atualização');
      } else {
        setLoading(true);
      }
      
      // First fetch auth users
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        throw error;
      }
      
      // Use type assertion to avoid deep type issues
      const authUsers = (data as any).users || [];
      
      if (!authUsers.length) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Now fetch profiles to get admin status
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, is_admin');
        
      if (profilesError) {
        throw profilesError;
      }
      
      // Merge the data
      const mergedUsers = authUsers.map((user: any) => {
        const profile = profiles?.find(p => p.id === user.id);
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
      
      // Se temos dados em cache, continue usando-os em caso de erro
      const cachedData = getCachedUsers();
      if (cachedData) {
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
      
      // Atualizar também no cache
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

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, fetchUsers, toggleAdminStatus };
}
