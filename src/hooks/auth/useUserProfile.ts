
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
  const hasCheckedInvites = useRef(false);
  const hasEmailSynced = useRef(false);
  const lastFetchedUserId = useRef<string | null>(null);
  const { getCache, setCache, clearCache } = useCache();
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const CACHE_KEY = 'user_profile';

  // Função para verificar e aplicar convites pendentes (APENAS UMA VEZ POR SESSÃO)
  const checkAndApplyInvite = useCallback(async (userId: string, userEmail: string) => {
    if (hasCheckedInvites.current) {
      return;
    }

    try {
      console.log('[useUserProfile] Verificando convites pendentes para:', userEmail);
      hasCheckedInvites.current = true;
      
      const { data: invites, error: inviteError } = await supabase
        .from('user_invites')
        .select('*')
        .eq('email', userEmail.toLowerCase())
        .gt('expires_at', new Date().toISOString())
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (inviteError) {
        console.log('[useUserProfile] Não foi possível buscar convites (normal se não houver permissão):', inviteError.message);
        return;
      }

      if (invites && invites.length > 0) {
        const invite = invites[0];
        console.log('[useUserProfile] Aplicando convite mais recente:', invite);

        const { data: existingRelation } = await supabase
          .from('user_empresa')
          .select('id')
          .eq('user_id', userId)
          .eq('empresa_id', invite.company_id)
          .single();

        if (existingRelation) {
          console.log('[useUserProfile] Usuário já vinculado a esta empresa, marcando convite como usado');
          
          await supabase
            .from('user_invites')
            .update({ used: true, used_at: new Date().toISOString() })
            .eq('id', invite.id);
          
          return;
        }

        const profileUpdates: any = {
          display_name: invite.display_name,
          primeiro_login: false
        };

        if (invite.cidade) profileUpdates.cidade = invite.cidade;
        if (invite.aniversario) profileUpdates.aniversario = invite.aniversario;
        if (invite.data_inicio) profileUpdates.data_inicio = invite.data_inicio;
        if (invite.tipo_contrato) profileUpdates.tipo_contrato = invite.tipo_contrato;
        if (invite.nivel_colaborador) profileUpdates.nivel_colaborador = invite.nivel_colaborador;

        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (updateError) {
          console.error('[useUserProfile] Erro ao atualizar perfil com convite:', updateError);
          return;
        }

        const { error: companyError } = await supabase
          .from('user_empresa')
          .insert({
            user_id: userId,
            empresa_id: invite.company_id
          });

        if (companyError) {
          console.error('[useUserProfile] Erro ao vincular usuário à empresa:', companyError);
        } else {
          console.log('[useUserProfile] Usuário vinculado à empresa com sucesso:', invite.company_id);
          window.dispatchEvent(new CustomEvent('company-relation-changed'));
        }

        await supabase
          .from('user_invites')
          .update({ used: true, used_at: new Date().toISOString() })
          .eq('id', invite.id);

        console.log('[useUserProfile] Convite aplicado com sucesso');
        toast.success(`Seu perfil foi configurado automaticamente! Bem-vindo à empresa.`);
      }
    } catch (error) {
      console.log('[useUserProfile] Erro ao verificar convites (não crítico):', error);
    }
  }, []);

  // Função para sincronizar email apenas uma vez
  const syncEmailWithAuth = useCallback(async (userId: string, authEmail: string) => {
    if (hasEmailSynced.current) {
      return;
    }

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (!profileData?.email || profileData.email !== authEmail) {
        const { error } = await supabase
          .from('profiles')
          .update({ email: authEmail })
          .eq('id', userId);

        if (error) {
          console.error('Erro ao sincronizar email:', error);
        } else {
          console.log('Email sincronizado com sucesso');
          hasEmailSynced.current = true;
        }
      } else {
        hasEmailSynced.current = true;
      }
    } catch (error) {
      console.error('Erro ao verificar sincronização de email:', error);
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    // Evitar múltiplas requisições para o mesmo usuário
    if (fetchInProgress.current && !forceRefresh) {
      return;
    }

    // Se já buscou para este usuário e não é refresh forçado, usar cache
    if (lastFetchedUserId.current === userId && hasFetchedOnce.current && !forceRefresh) {
      return;
    }

    try {
      fetchInProgress.current = true;
      setIsLoading(true);
      
      console.log('[useUserProfile] Fetching user profile for:', userId, 'forceRefresh:', forceRefresh);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Sincronizar email apenas uma vez
      if (user?.email && !hasEmailSynced.current) {
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
          
          // Verificar convites apenas uma vez após criar perfil
          if (user?.email && !hasCheckedInvites.current) {
            await checkAndApplyInvite(userId, user.email);
          }
          
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
        
        // Verificar convites apenas se é primeiro login E ainda não verificou
        if (profileData.primeiro_login && user?.email && !hasCheckedInvites.current) {
          await checkAndApplyInvite(userId, user.email);
          
          // Buscar perfil atualizado após aplicar convite
          const { data: updatedData } = await supabase
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
            
          if (updatedData) {
            profileData = updatedData;
          }
        }
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
        
        lastFetchedUserId.current = userId;
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
  }, [setCache, syncEmailWithAuth, checkAndApplyInvite]);

  // Load profile from cache only once
  useEffect(() => {
    if (!hasFetchedOnce.current) {
      const cachedProfile = getCache<UserProfile>({ key: CACHE_KEY });
      if (cachedProfile) {
        setUserProfile(cachedProfile);
        hasFetchedOnce.current = true;
        lastFetchedUserId.current = cachedProfile.id;
      }
    }
  }, [getCache]);

  const clearProfile = useCallback(() => {
    setUserProfile(null);
    hasFetchedOnce.current = false;
    hasCheckedInvites.current = false;
    hasEmailSynced.current = false;
    lastFetchedUserId.current = null;
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
    syncEmailWithAuth,
    checkAndApplyInvite
  };
};
