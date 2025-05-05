
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
        },
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes('User already registered')) {
          return {
            success: false,
            needsEmailConfirmation: false,
            error: {
              message: 'E-mail já cadastrado. Tente fazer login ou recuperar sua senha.',
              code: 'email_already_registered'
            }
          };
        }
        throw error;
      }

      // User signed up but needs email confirmation (no session available yet)
      if (data.user && !data.session) {
        console.log('Usuário cadastrado, esperando confirmação de e-mail');
        return {
          success: true,
          needsEmailConfirmation: true,
          error: null,
          user: data.user
        };
      }

      // User signed up and session available (email confirmation not required)
      if (data.user && data.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            display_name: displayName,
            interesses: metadata?.interests || [],
            primeiro_login: true
          })
          .eq('id', data.user.id);
          
        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
        }

        // Aguardar um momento para garantir que o perfil foi criado corretamente
        await fetchUserProfile(data.user.id);
        
        // Redirecionar explicitamente para a tela de onboarding após cadastro
        toast.success('Cadastro realizado com sucesso! Redirecionando para configuração inicial...');
        navigate('/onboarding', { replace: true });

        return {
          success: true,
          needsEmailConfirmation: false,
          error: null,
          user: data.user,
          session: data.session
        };
      }

      return {
        success: false,
        needsEmailConfirmation: false,
        error: {
          message: 'Erro desconhecido no cadastro',
          code: 'unknown_error'
        }
      };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return {
        success: false,
        needsEmailConfirmation: false,
        error: {
          message: error.message || 'Falha no cadastro',
          code: 'signup_error'
        }
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, navigate, fetchUserProfile]);

  const resendConfirmationEmail = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) throw error;
      
      toast.success('E-mail de confirmação reenviado com sucesso!');
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao reenviar e-mail de confirmação:', error);
      toast.error('Erro ao reenviar e-mail: ' + error.message);
      return { 
        success: false, 
        error: {
          message: error.message,
          code: 'resend_email_error'
        }
      };
    }
  }, []);

  return {
    signInWithPassword,
    signOut,
    signUp,
    resendConfirmationEmail
  };
};
