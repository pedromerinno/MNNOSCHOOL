
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchInProgress = useRef(false);
  const lastFetchTimestamp = useRef(0);
  
  // Cache de 2 minutos para reduzir chamadas ao servidor
  const CACHE_DURATION = 2 * 60 * 1000;

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Evita chamadas duplicadas simultâneas
    if (fetchInProgress.current) {
      console.log('Uma busca de perfil já está em andamento, evitando chamada duplicada');
      return;
    }

    // Evita chamadas frequentes demais
    const now = Date.now();
    if (now - lastFetchTimestamp.current < CACHE_DURATION && userProfile) {
      console.log('Usando cache de perfil de usuário, menos de 2 minutos desde a última busca');
      return;
    }

    try {
      console.log(`Buscando perfil do usuário: ${userId}`);
      fetchInProgress.current = true;
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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
          primeiro_login: data.primeiro_login,
          created_at: data.created_at
        };
        
        console.log('Perfil de usuário carregado:', profile);
        setUserProfile(profile);
        lastFetchTimestamp.current = now;
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      fetchInProgress.current = false;
      setIsLoading(false);
    }
  }, [userProfile]);

  // Limpa o perfil se o userId mudar
  const clearProfile = useCallback(() => {
    setUserProfile(null);
    lastFetchTimestamp.current = 0;
  }, []);

  const updateUserProfile = useCallback((userData: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? ({
      ...prev,
      ...userData,
    }) : null);
  }, []);

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
    isLoading,
    fetchUserProfile,
    clearProfile,
    updateUserProfile,
    updateUserData,
    setUserProfile
  };
};
