
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseAuthMethodsProps {
  fetchUserProfile: (userId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthMethods = ({ 
  fetchUserProfile, 
  setLoading 
}: UseAuthMethodsProps) => {
  const navigate = useNavigate();

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        await fetchUserProfile(data.session.user.id);
        navigate('/');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { data: null, error };
    }
  }, [fetchUserProfile, navigate]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      // Redirecionar para página de login após logout
      navigate('/login');
      toast.success('Você saiu da sua conta');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, setLoading]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    displayName: string, 
    metadata?: { interests?: string[], company_id?: string }
  ) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            interests: metadata?.interests || [],
            company_id: metadata?.company_id || null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const userData: any = { 
          display_name: displayName,
          interesses: metadata?.interests || [],
          primeiro_login: true
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(userData)
          .eq('id', data.user.id);
          
        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
        }

        // Se tiver company_id, criar relacionamento com a empresa
        if (metadata?.company_id) {
          const { error: companyRelationError } = await supabase
            .from('user_empresa')
            .insert({
              user_id: data.user.id,
              empresa_id: metadata.company_id,
            });
            
          if (companyRelationError) {
            console.error('Erro ao vincular usuário à empresa:', companyRelationError);
          }
        }

        // Aguardar um momento para garantir que o perfil foi criado corretamente
        await fetchUserProfile(data.user.id);
        
        // Redirecionar explicitamente para a tela de onboarding após cadastro
        toast.success('Cadastro realizado com sucesso! Redirecionando para configuração inicial...');
        navigate('/onboarding', { replace: true });
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.error_description || error.message || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  }, [setLoading, navigate, fetchUserProfile]);
  
  // Adicionar método para identificar e lidar com usuários autenticados externamente
  const handleExternalAuth = useCallback(async (session) => {
    try {
      if (!session?.user) return;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('primeiro_login, interesses')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Erro ao verificar perfil:', profileError);
        return;
      }
      
      const isNewUser = profile.primeiro_login === true || 
                      (profile.interesses && profile.interesses.includes('onboarding_incomplete'));
      
      if (isNewUser) {
        console.log('Novo usuário detectado, redirecionando para onboarding');
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Erro ao processar autenticação externa:', error);
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return {
    signInWithPassword,
    signOut,
    signUp,
    handleExternalAuth
  };
};
