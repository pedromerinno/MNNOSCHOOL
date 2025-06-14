
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';
import { useCache } from '@/hooks/useCache';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchInProgress = useRef(false);
  const hasFetchedOnce = useRef(false);
  const { getCache, setCache, clearCache } = useCache();
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const CACHE_KEY = 'user_profile';

  // Função para sincronizar email do perfil com email de autenticação
  const syncEmailWithAuth = useCallback(async (userId: string, authEmail: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      // Se o email do perfil não existe ou é diferente do email de auth, atualiza
      if (!profileData?.email || profileData.email !== authEmail) {
        const { error } = await supabase
          .from('profiles')
          .update({ email: authEmail })
          .eq('id', userId);

        if (error) {
          console.error('Erro ao sincronizar email:', error);
        } else {
          console.log('Email sincronizado com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sincronização de email:', error);
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    // Prevent multiple fetches, but allow force refresh
    if (fetchInProgress.current && !forceRefresh) {
      return;
    }

    try {
      fetchInProgress.current = true;
      setIsLoading(true);
      
      console.log('[useUserProfile] Fetching user profile for:', userId, 'forceRefresh:', forceRefresh);
      
      // Buscar dados do usuário autenticado para obter email atual
      const { data: { user } } = await supabase.auth.getUser();
      
      // Sincronizar email antes de buscar o perfil
      if (user?.email) {
        await syncEmailWithAuth(userId, user.email);
      }
      
      let profileData;
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          aniversario,
          tipo_contrato,
          cidade,
          data_inicio,
          manual_cultura_aceito,
          nivel_colaborador
        `)
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found for user, creating one...');
          
          // Se não encontrar perfil, criar um básico
          const newProfile = {
            id: userId,
            email: user?.email || null,
            display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || null,
            primeiro_login: true,
          };
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert(newProfile);
            
          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            return;
          }
          
          // Buscar o perfil recém-criado
          const { data: newData, error: newError } = await supabase
            .from('profiles')
            .select(`
              *,
              aniversario,
              tipo_contrato,
              cidade,
              data_inicio,
              manual_cultura_aceito,
              nivel_colaborador
            `)
            .eq('id', userId)
            .single();
            
          if (newError || !newData) {
            console.error('Erro ao buscar perfil recém-criado:', newError);
            return;
          }
          
          profileData = newData;
        } else {
          console.error('Erro ao buscar perfil:', error);
          return;
        }
      } else {
        profileData = data;
      }

      if (profileData) {
        const profile: UserProfile = {
          id: profileData.id,
          email: profileData.email || user?.email || null,
          display_name: profileData.display_name,
          is_admin: profileData.is_admin,
          super_admin: profileData.super_admin,
          avatar: profileData.avatar,
          cargo_id: profileData.cargo_id,
          primeiro_login: profileData.primeiro_login,
          created_at: profileData.created_at,
          // Novas colunas com type casting seguro
          aniversario: profileData.aniversario,
          tipo_contrato: profileData.tipo_contrato as 'CLT' | 'PJ' | 'Fornecedor' | null,
          cidade: profileData.cidade,
          data_inicio: profileData.data_inicio,
          manual_cultura_aceito: profileData.manual_cultura_aceito,
          nivel_colaborador: profileData.nivel_colaborador as 'Junior' | 'Pleno' | 'Senior' | null
        };
        
        console.log('[useUserProfile] Profile loaded:', profile.display_name, 'with extra data:', {
          cidade: profile.cidade,
          aniversario: profile.aniversario,
          tipo_contrato: profile.tipo_contrato,
          nivel_colaborador: profile.nivel_colaborador
        });
        
        setUserProfile(profile);
        setCache({ key: CACHE_KEY, expirationMinutes: 5 }, profile);
        
        // Se é um refresh forçado, não marcar como fetched para permitir futuras atualizações
        if (!forceRefresh) {
          hasFetchedOnce.current = true;
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      fetchInProgress.current = false;
      setIsLoading(false);
    }
  }, [setCache, syncEmailWithAuth]);

  // Load profile from cache only once
  useEffect(() => {
    if (!hasFetchedOnce.current) {
      const cachedProfile = getCache<UserProfile>({ key: CACHE_KEY });
      if (cachedProfile) {
        setUserProfile(cachedProfile);
        hasFetchedOnce.current = true;
      }
    }
  }, [getCache]);

  const clearProfile = useCallback(() => {
    setUserProfile(null);
    hasFetchedOnce.current = false;
    clearCache({ key: CACHE_KEY });
  }, [clearCache]);

  const updateUserProfile = useCallback((userData: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? ({
      ...prev,
      ...userData,
    }) : null);
  }, []);

  const updateUserData = async (userId: string, userData: Partial<UserProfile>) => {
    if (!userId) {
      toast.error('No logged in user');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId);

      if (error) {
        toast.error('Error updating data: ' + error.message);
        return;
      }

      setUserProfile(prevProfile => prevProfile ? ({
        ...prevProfile,
        ...userData,
      }) : null);
      
      const cachedProfile = getCache<UserProfile>({ key: CACHE_KEY });
      if (cachedProfile) {
        setCache({ key: CACHE_KEY, expirationMinutes: 5 }, {
          ...cachedProfile,
          ...userData
        });
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Error updating data: ' + error.message);
    }
  };

  return {
    userProfile,
    isLoading,
    fetchUserProfile,
    clearProfile,
    updateUserProfile,
    updateUserData,
    setUserProfile,
    syncEmailWithAuth
  };
};
