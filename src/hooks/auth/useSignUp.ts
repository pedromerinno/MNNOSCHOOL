
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEmailVerification } from './useEmailVerification';

interface UseSignUpProps {
  fetchUserProfile: (userId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useSignUp = ({
  fetchUserProfile,
  setLoading
}: UseSignUpProps) => {
  const navigate = useNavigate();
  const { checkEmailExists } = useEmailVerification({ setLoading });

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    displayName: string
  ) => {
    try {
      setLoading(true);
      
      console.log("Verificando se o e-mail já existe antes de tentar criar");
      
      // Primeiro tentamos ver se conseguimos encontrar o e-mail já cadastrado diretamente
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
      
      // Alternativas para checar se e-mail existe
      // 1. Tentamos fazer signup e verificamos se retorna erro de usuário já existente
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
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
            email: email, // Garantir que o email seja sincronizado
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
  }, [setLoading, navigate, fetchUserProfile, checkEmailExists]);

  return { signUp };
};
