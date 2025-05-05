
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface UseSignInWithPasswordProps {
  fetchUserProfile: (userId: string) => Promise<void>;
}

export const useSignInWithPassword = ({ fetchUserProfile }: UseSignInWithPasswordProps) => {
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

  return { signInWithPassword };
};
