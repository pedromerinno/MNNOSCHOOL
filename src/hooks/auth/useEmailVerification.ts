
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseEmailVerificationProps {
  setLoading: (loading: boolean) => void;
}

export const useEmailVerification = ({ setLoading }: UseEmailVerificationProps) => {
  const checkEmailExists = useCallback(async (email: string): Promise<boolean> => {
    try {
      // Verificar usando o método signInWithPassword com uma senha inválida
      // para ver se o usuário existe (retornará um erro específico)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: "check_only_not_a_real_password"
      });
      
      // Se o erro mencionar "Invalid login credentials", o e-mail provavelmente existe
      if (error && error.message.includes('Invalid login credentials')) {
        return true;
      }
      
      // Verificar na tabela de perfis como backup
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      return !!profileData;  // Retorna true se encontrar um perfil com este e-mail
      
    } catch (error) {
      console.error('Erro ao verificar e-mail:', error);
      return false;
    }
  }, []);

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
    checkEmailExists,
    resendConfirmationEmail
  };
};
