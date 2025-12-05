
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
  // Removido: flag RLS que estava bloqueando carregamento de perfil
  const { getCache, setCache, clearCache } = useCache();
  
  // Removido: verificação de flag RLS que estava bloqueando carregamento de perfil
  
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
        // Campos tipo_contrato, data_inicio, nivel_colaborador foram movidos para user_empresa
        // Não precisam ser atualizados em profiles

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
    // Removido: verificação de flag RLS que estava bloqueando sincronização
    
    if (hasEmailSynced.current) {
      return;
    }

    try {
      const { data: profileData, error: selectError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      // Se houver erro de RLS, tentar continuar mas logar o erro
      if (selectError?.code === '42P17') {
        console.warn('[useUserProfile] RLS error detected in email sync, but continuing');
        hasEmailSynced.current = true; // Marcar como sincronizado para não tentar mais
        return;
      }

      if (!profileData?.email || profileData.email !== authEmail) {
        const { error } = await supabase
          .from('profiles')
          .update({ email: authEmail })
          .eq('id', userId);

        if (error) {
          // Se for erro de RLS, tentar continuar mas logar o erro
          if (error.code === '42P17') {
            console.warn('[useUserProfile] RLS error detected in email update, but continuing');
            hasEmailSynced.current = true;
          } else {
            console.error('Erro ao sincronizar email:', error);
          }
        } else {
          console.log('Email sincronizado com sucesso');
          hasEmailSynced.current = true;
        }
      } else {
        hasEmailSynced.current = true;
      }
    } catch (error: any) {
      // Se for erro de RLS, tentar continuar mas logar o erro
      if (error?.code === '42P17') {
        console.warn('[useUserProfile] RLS error detected in email sync, but continuing');
        hasEmailSynced.current = true;
      } else {
        console.error('Erro ao verificar sincronização de email:', error);
      }
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    // Removido: verificação de flag RLS que estava bloqueando carregamento
    
    console.log('[useUserProfile] fetchUserProfile called:', {
      userId,
      forceRefresh,
      fetchInProgress: fetchInProgress.current,
      lastFetchedUserId: lastFetchedUserId.current,
      hasFetchedOnce: hasFetchedOnce.current,
      hasProfile: !!userProfile
    });

    // Evitar múltiplas requisições para o mesmo usuário (exceto se for refresh forçado)
    if (fetchInProgress.current && !forceRefresh) {
      console.log('[useUserProfile] Fetch already in progress, skipping...');
      return Promise.resolve();
    }

    // Se já buscou para este usuário e não é refresh forçado, verificar se temos perfil
    if (lastFetchedUserId.current === userId && hasFetchedOnce.current && !forceRefresh) {
      if (userProfile && userProfile.id === userId) {
        console.log('[useUserProfile] Profile already loaded for this user, skipping fetch');
        return Promise.resolve();
      }
      // Se não temos perfil mas já tentamos, não tentar novamente a menos que seja forçado
      console.log('[useUserProfile] Already attempted fetch for this user, but no profile found. Use forceRefresh=true to retry.');
      return Promise.resolve();
    }

    try {
      fetchInProgress.current = true;
      setIsLoading(true);
      
      console.log('[useUserProfile] Starting profile fetch for:', userId, 'forceRefresh:', forceRefresh);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id !== userId) {
        console.error('[useUserProfile] User mismatch or not found:', { requestedUserId: userId, actualUserId: user?.id });
        throw new Error('User mismatch or not authenticated');
      }
      
      // Sincronizar email apenas uma vez
      if (user?.email && !hasEmailSynced.current) {
        await syncEmailWithAuth(userId, user.email);
      }
      
      let profileData;
      
      // Tentar buscar da tabela profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar, super_admin, primeiro_login, created_at, aniversario, cidade')
        .eq('id', userId)
        .maybeSingle(); // Usar maybeSingle ao invés de single para não falhar se não existir

      console.log('[useUserProfile] Profiles query result:', { 
        hasData: !!data, 
        error: error ? { code: error.code, message: error.message } : null, 
        userId,
        dataKeys: data ? Object.keys(data) : null
      });

      if (error) {
        // Se for erro de RLS, tentar usar cache ou dados básicos do usuário
        if (error.code === '42P17') {
          console.warn('[useUserProfile] RLS error detected, trying to use cache or basic user data');
          // Tentar usar cache primeiro
          const cachedProfile = getCache<UserProfile>({ key: CACHE_KEY });
          if (cachedProfile && cachedProfile.id === userId) {
            console.log('[useUserProfile] Using cached profile due to RLS error');
            setUserProfile(cachedProfile);
            setIsLoading(false);
            fetchInProgress.current = false;
            lastFetchedUserId.current = userId;
            hasFetchedOnce.current = true;
            return Promise.resolve();
          }
          // Se não tem cache, criar perfil básico com dados do usuário
          if (user?.email) {
            const basicProfile: UserProfile = {
              id: userId,
              email: user.email,
              display_name: user.user_metadata?.display_name || user.email.split('@')[0] || null,
              super_admin: false,
              avatar: null,
              primeiro_login: true,
              created_at: new Date().toISOString(),
              aniversario: null,
              cidade: null
            };
            console.log('[useUserProfile] Using basic profile due to RLS error');
            setUserProfile(basicProfile);
            setIsLoading(false);
            fetchInProgress.current = false;
            lastFetchedUserId.current = userId;
            hasFetchedOnce.current = true;
            return Promise.resolve();
          }
        }
        
        // Se não encontrou perfil (PGRST116) ou retornou null, criar um básico
        if (error?.code === 'PGRST116' || (!data && !error)) {
          console.log('[useUserProfile] No profile found for user, creating one...');
          
          // Criar perfil básico com dados do usuário autenticado
          const newProfile = {
            id: userId,
            email: user?.email || null,
            display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || null,
            primeiro_login: true,
          };
          
          console.log('[useUserProfile] Attempting to create profile:', newProfile);
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert(newProfile);
            
          if (createError) {
            console.error('[useUserProfile] Erro ao criar perfil:', createError);
            // Mesmo se falhar ao criar, usar dados básicos do usuário
            profileData = {
              id: userId,
              email: user?.email || null,
              display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || null,
              avatar: null,
              super_admin: false,
              primeiro_login: true,
              created_at: new Date().toISOString(),
              aniversario: null,
              cidade: null
            };
          } else {
            // Verificar convites apenas uma vez após criar perfil
            if (user?.email && !hasCheckedInvites.current) {
              await checkAndApplyInvite(userId, user.email);
            }
            
            // Buscar perfil recém-criado
            const { data: newData, error: newError } = await supabase
              .from('profiles')
              .select('id, display_name, email, avatar, super_admin, primeiro_login, created_at, aniversario, cidade')
              .eq('id', userId)
              .maybeSingle();
              
            if (newError) {
              console.error('[useUserProfile] Erro ao buscar perfil recém-criado:', newError);
              // Usar dados básicos mesmo se falhar
              profileData = {
                id: userId,
                email: user?.email || null,
                display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || null,
                avatar: null,
                super_admin: false,
                primeiro_login: true,
                created_at: new Date().toISOString(),
                aniversario: null,
                cidade: null
              };
            } else {
              profileData = newData || {
                id: userId,
                email: user?.email || null,
                display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || null,
                avatar: null,
                super_admin: false,
                primeiro_login: true,
                created_at: new Date().toISOString(),
                aniversario: null,
                cidade: null
              };
            }
          }
        } else {
          // Erro ao buscar perfil
          console.error('[useUserProfile] Erro ao buscar perfil:', error);
          // Se for erro de RLS, tentar usar cache ou dados básicos do usuário
          if (error.code === '42P17') {
            console.warn('[useUserProfile] RLS error detected, trying to use cache or basic user data');
            // Tentar usar cache primeiro
            const cachedProfile = getCache<UserProfile>({ key: CACHE_KEY });
            if (cachedProfile && cachedProfile.id === userId) {
              console.log('[useUserProfile] Using cached profile due to RLS error');
              setUserProfile(cachedProfile);
              setIsLoading(false);
              fetchInProgress.current = false;
              lastFetchedUserId.current = userId;
              hasFetchedOnce.current = true;
              return Promise.resolve();
            }
            // Se não tem cache, criar perfil básico com dados do usuário
            if (user?.email) {
              const basicProfile: UserProfile = {
                id: userId,
                email: user.email,
                display_name: user.user_metadata?.display_name || user.email.split('@')[0] || null,
                super_admin: false,
                avatar: null,
                primeiro_login: true,
                created_at: new Date().toISOString(),
                aniversario: null,
                cidade: null
              };
              console.log('[useUserProfile] Using basic profile due to RLS error');
              setUserProfile(basicProfile);
              setIsLoading(false);
              fetchInProgress.current = false;
              lastFetchedUserId.current = userId;
              hasFetchedOnce.current = true;
              return Promise.resolve();
            }
          }
          // Marcar como tentado para evitar loops
          lastFetchedUserId.current = userId;
          hasFetchedOnce.current = true;
          // Não retornar aqui - deixar o finally executar para definir isLoading como false
          return Promise.resolve();
        }
      } else {
        // Dados carregados com sucesso!
        profileData = data;
        
        console.log('[useUserProfile] ✅ Data loaded successfully! Raw data:', data);
        console.log('[useUserProfile] Processing profile data:', {
          hasProfileData: !!profileData,
          display_name: profileData?.display_name,
          email: profileData?.email,
          primeiro_login: profileData?.primeiro_login,
          super_admin: profileData?.super_admin
        });
        
        // Verificar convites apenas se é primeiro login E ainda não verificou
        if (profileData && profileData.primeiro_login && user?.email && !hasCheckedInvites.current) {
          console.log('[useUserProfile] Checking invites for first login user...');
          await checkAndApplyInvite(userId, user.email);
          
          // Buscar perfil atualizado após aplicar convite
          const { data: updatedData, error: updateError } = await supabase
            .from('profiles')
            .select('id, display_name, email, avatar, super_admin, primeiro_login, created_at, aniversario, cidade')
            .eq('id', userId)
            .maybeSingle();
            
          if (updateError) {
            console.warn('[useUserProfile] Error fetching updated profile after invite:', updateError);
            // Continuar com os dados originais se houver erro
          } else if (updatedData) {
            console.log('[useUserProfile] Using updated profile after invite');
            profileData = updatedData;
          }
        }
      }

      // Se não encontrou profileData, criar um básico
      if (!profileData && user?.email) {
        console.warn('[useUserProfile] No profileData found, creating basic profile from auth user');
        profileData = {
          id: userId,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email.split('@')[0] || null,
          avatar: null,
          super_admin: false,
          primeiro_login: true,
          created_at: new Date().toISOString(),
          aniversario: null,
          cidade: null
        };
      }

      // GARANTIR que sempre temos um perfil para definir no estado
      if (profileData) {
        const profile: UserProfile = {
          id: profileData.id,
          email: profileData.email || user?.email || null,
          display_name: profileData.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || null,
          super_admin: profileData.super_admin || false,
          avatar: profileData.avatar || null,
          primeiro_login: profileData.primeiro_login || false,
          created_at: profileData.created_at || new Date().toISOString(),
          aniversario: profileData.aniversario || null,
          cidade: profileData.cidade || null
        };
        
        console.log('[useUserProfile] ✅ Profile loaded successfully:', {
          id: profile.id,
          display_name: profile.display_name,
          email: profile.email,
          super_admin: profile.super_admin,
          cidade: profile.cidade,
          aniversario: profile.aniversario
        });
        
        setUserProfile(profile);
        setCache({ key: CACHE_KEY, expirationMinutes: 5 }, profile);
        
        lastFetchedUserId.current = userId;
        hasFetchedOnce.current = true;
      } else if (user?.email) {
        // Último fallback - criar perfil mínimo do usuário autenticado
        console.log('[useUserProfile] Using minimal fallback profile from auth user');
        const fallbackProfile: UserProfile = {
          id: userId,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email.split('@')[0] || null,
          super_admin: false,
          avatar: null,
          primeiro_login: true,
          created_at: new Date().toISOString(),
          aniversario: null,
          cidade: null
        };
        
        console.log('[useUserProfile] ✅ Fallback profile set:', fallbackProfile);
        setUserProfile(fallbackProfile);
        lastFetchedUserId.current = userId;
        hasFetchedOnce.current = true;
      }
    } catch (error: any) {
      console.error('[useUserProfile] Error fetching profile:', error);
      
      // Em caso de erro, tentar pelo menos definir dados básicos do usuário
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.email) {
          const errorFallbackProfile: UserProfile = {
            id: userId,
            email: authUser.email,
            display_name: authUser.user_metadata?.display_name || authUser.email.split('@')[0] || null,
            super_admin: false,
            avatar: null,
            primeiro_login: true,
            created_at: new Date().toISOString(),
            aniversario: null,
            cidade: null
          };
          
          console.log('[useUserProfile] ⚠️ Error fallback profile set:', errorFallbackProfile);
          setUserProfile(errorFallbackProfile);
          lastFetchedUserId.current = userId;
          hasFetchedOnce.current = true;
        }
      } catch (fallbackError) {
        console.error('[useUserProfile] Even fallback failed:', fallbackError);
      }
    } finally {
      fetchInProgress.current = false;
      setIsLoading(false);
      
      console.log('[useUserProfile] Fetch completed. Final state:', {
        userId,
        hasProfile: !!userProfile,
        isLoading: false
      });
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
