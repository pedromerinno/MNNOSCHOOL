
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

  // Função para verificar e aplicar convites pendentes (APENAS UM) - SIMPLIFICADA
  const checkAndApplyInvite = useCallback(async (userId: string, userEmail: string) => {
    try {
      console.log('[useUserProfile] Verificando convites pendentes para:', userEmail);
      
      // Buscar APENAS o convite mais recente e não usado
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
        return; // Não é um erro crítico
      }

      if (invites && invites.length > 0) {
        const invite = invites[0];
        console.log('[useUserProfile] Aplicando convite mais recente:', invite);

        // Verificar se o usuário já não está vinculado a esta empresa
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

        // Aplicar dados do convite ao perfil
        const profileUpdates: any = {
          display_name: invite.display_name,
          primeiro_login: false
        };

        if (invite.cidade) profileUpdates.cidade = invite.cidade;
        if (invite.aniversario) profileUpdates.aniversario = invite.aniversario;
        if (invite.data_inicio) profileUpdates.data_inicio = invite.data_inicio;
        if (invite.tipo_contrato) profileUpdates.tipo_contrato = invite.tipo_contrato;
        if (invite.nivel_colaborador) profileUpdates.nivel_colaborador = invite.nivel_colaborador;

        // Atualizar perfil
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (updateError) {
          console.error('[useUserProfile] Erro ao atualizar perfil com convite:', updateError);
          return;
        }

        // Vincular usuário à empresa
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

        // Marcar convite como usado
        await supabase
          .from('user_invites')
          .update({ used: true, used_at: new Date().toISOString() })
          .eq('id', invite.id);

        console.log('[useUserProfile] Convite aplicado com sucesso');
        toast.success(`Seu perfil foi configurado automaticamente! Bem-vindo à empresa.`);
      } else {
        console.log('[useUserProfile] Nenhum convite pendente encontrado para:', userEmail);
      }
    } catch (error) {
      console.log('[useUserProfile] Erro ao verificar convites (não crítico):', error);
      // Não fazer nada - convites são opcionais
    }
  }, []);

  // Função para sincronizar email do perfil com email de autenticação
  const syncEmailWithAuth = useCallback(async (userId: string, authEmail: string) => {
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
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sincronização de email:', error);
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    if (fetchInProgress.current && !forceRefresh) {
      return;
    }

    try {
      fetchInProgress.current = true;
      setIsLoading(true);
      
      console.log('[useUserProfile] Fetching user profile for:', userId, 'forceRefresh:', forceRefresh);
      
      const { data: { user } } = await supabase.auth.getUser();
      
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
          if (user?.email) {
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
        
        // Verificar convites apenas se é primeiro login
        if (profileData.primeiro_login && user?.email) {
          await checkAndApplyInvite(userId, user.email);
          
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
      }
    }
  }, [getCache]);

  const clearProfile = useCallback(() => {
    setUserProfile(null);
    hasFetchedOnce.current = false;
    clearCache({ key: CACHE_KEY });
  }, [clearCache]);

  const updateUserProfile = useCallback(async (userData: Partial<UserProfile>) => {
    const currentUserId = userProfile?.id;
    
    if (!currentUserId) {
      console.error('No user ID available for profile update');
      return;
    }

    try {
      console.log('[useUserProfile] Atualizando perfil do usuário:', currentUserId, userData);
      
      // Atualizar diretamente no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', currentUserId);

      if (error) {
        console.error('[useUserProfile] Erro ao atualizar perfil no banco:', error);
        throw error;
      }

      console.log('[useUserProfile] Perfil atualizado com sucesso no banco de dados');
      
      // Atualizar estado local
      setUserProfile(prev => prev ? ({
        ...prev,
        ...userData,
      }) : null);
      
      // Atualizar cache
      const cachedProfile = getCache<UserProfile>({ key: CACHE_KEY });
      if (cachedProfile) {
        setCache({ key: CACHE_KEY, expirationMinutes: 5 }, {
          ...cachedProfile,
          ...userData
        });
      }
      
    } catch (error: any) {
      console.error('[useUserProfile] Erro ao atualizar perfil:', error);
      throw error;
    }
  }, [userProfile?.id, setCache, getCache]);

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
