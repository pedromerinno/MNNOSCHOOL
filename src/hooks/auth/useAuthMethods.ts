
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
          // Remover emailRedirectTo para não exigir confirmação
          // emailRedirectTo: window.location.origin
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            display_name: displayName,
            interesses: metadata?.interests || []
          })
          .eq('id', data.user.id);
          
        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
        }

        // Redirecionar para a tela de onboarding após cadastro
        navigate('/onboarding');
        toast.success('Cadastro realizado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.error_description || error.message || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  }, [setLoading, navigate]);

  return {
    signInWithPassword,
    signOut,
    signUp
  };
};
