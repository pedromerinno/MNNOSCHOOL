
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from '@/types/user';

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
        // Não redirecionamos aqui - deixamos ProtectedRoute fazer isso para verificar onboarding
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { data: null, error };
    }
  }, [fetchUserProfile]);

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
    metadata?: { interests?: string[] }
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
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            display_name: displayName,
            interesses: metadata?.interests || [],
            primeiro_login: true // Garantir que o primeiro_login esteja definido como true
          })
          .eq('id', data.user.id);
          
        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
        }

        // Aguardar um momento para garantir que o perfil foi criado corretamente
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.error_description || error.message || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  }, [setLoading, fetchUserProfile]);

  // Nova função para lidar com login de provedores sociais
  const handleExternalAuth = useCallback(async (provider: 'google') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;

      // O redirecionamento é gerenciado pelo Supabase
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro no login social:', error);
      toast.error('Erro ao fazer login: ' + error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return {
    signInWithPassword,
    signOut,
    signUp,
    handleExternalAuth
  };
};
