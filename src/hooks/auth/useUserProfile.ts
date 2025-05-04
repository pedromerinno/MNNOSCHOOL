
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log(`Buscando perfil do usuário: ${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, is_admin, super_admin, avatar, cargo_id, interesses, primeiro_login')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          display_name: data.display_name,
          is_admin: data.is_admin,
          super_admin: data.super_admin,
          avatar: data.avatar,
          cargo_id: data.cargo_id,
          interesses: data.interesses,
          primeiro_login: data.primeiro_login
        };
        
        console.log('Perfil de usuário carregado:', profile);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  }, []);

  const updateUserProfile = async (userData: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? ({
      ...prev,
      ...userData,
    }) : null);
  };

  const updateUserData = async (userId: string, userData: Partial<UserProfile>) => {
    if (!userId) {
      toast.error('Nenhum usuário logado');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
        toast.error('Erro ao atualizar dados: ' + error.message);
        return;
      }

      setUserProfile(prevProfile => prevProfile ? ({
        ...prevProfile,
        ...userData,
      }) : null);
      
      toast.success('Perfil atualizado com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar dados do usuário:', error);
      toast.error('Erro ao atualizar dados: ' + error.message);
    }
  };

  return {
    userProfile,
    fetchUserProfile,
    updateUserProfile,
    updateUserData,
    setUserProfile
  };
};
