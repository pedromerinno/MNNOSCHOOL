
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
      
      // Verificar primeiro se o usuário já existe antes de tentar criar
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password: "checkonly" // Senha inválida para checar apenas existência
      });
      
      // Se há uma resposta sem erro, significa que o usuário existe
      if (existingUser.user) {
        console.log("Usuário já existe, retornando erro específico");
        return {
          success: false,
          needsEmailConfirmation: false,
          emailAlreadyRegistered: true,
          error: {
            message: 'E-mail já cadastrado. Tente fazer login ou recuperar sua senha.',
            code: 'email_already_registered'
          }
        };
      }
      
      // Continua com o cadastro normal
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
          console.log("Erro de usuário já registrado detectado");
          return {
            success: false,
            needsEmailConfirmation: false,
            error: {
              message: 'E-mail já cadastrado. Tente fazer login ou recuperar sua senha.',
              code: 'email_already_registered'
            },
            emailAlreadyRegistered: true
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
          user: data.user,
          emailAlreadyRegistered: false
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
          session: data.session,
          emailAlreadyRegistered: false
        };
      }

      return {
        success: false,
        needsEmailConfirmation: false,
        emailAlreadyRegistered: false,
        error: {
          message: 'Erro desconhecido no cadastro',
          code: 'unknown_error'
        }
      };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      // Verificar explicitamente mensagens de erro sobre email já cadastrado
      if (error.message && error.message.includes('User already registered')) {
        return {
          success: false,
          needsEmailConfirmation: false,
          emailAlreadyRegistered: true,
          error: {
            message: 'E-mail já cadastrado. Tente fazer login ou recuperar sua senha.',
            code: 'email_already_registered'
          }
        };
      }
      
      return {
        success: false,
        needsEmailConfirmation: false,
        emailAlreadyRegistered: false,
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
      setLoading(true);
      
      // Verificar primeiro se o usuário já tem conta ativa
      const { data: checkUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (checkUser) {
        return { 
          success: false, 
          error: {
            message: 'E-mail já cadastrado. Por favor, tente fazer login.',
            code: 'email_already_registered'
          }
        };
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        // Check specifically for already registered users
        if (error.message.includes('User already registered')) {
          return { 
            success: false, 
            error: {
              message: 'E-mail já cadastrado. Por favor, tente fazer login.',
              code: 'email_already_registered'
            }
          };
        }
        throw error;
      }
      
      toast.success('E-mail de confirmação reenviado com sucesso!');
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao reenviar e-mail de confirmação:', error);
      
      // Melhorar as mensagens de erro com base no tipo de erro
      let errorMessage = 'Erro ao reenviar e-mail.';
      let errorCode = 'resend_email_error';
      
      if (error.message.includes('too many requests')) {
        errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
      } else if (error.message.includes('Invalid')) {
        errorMessage = 'Endereço de e-mail inválido ou não encontrado.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'E-mail já cadastrado. Por favor, tente fazer login.';
        errorCode = 'email_already_registered';
      }
      
      toast.error(errorMessage);
      return { 
        success: false, 
        error: {
          message: errorMessage,
          code: errorCode
        }
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return {
    signInWithPassword,
    signOut,
    signUp,
    resendConfirmationEmail
  };
};
