
import { useCallback } from 'react';
import { useSignInWithPassword } from './useSignInWithPassword';
import { useSignOut } from './useSignOut';
import { useSignUp } from './useSignUp';
import { useEmailVerification } from './useEmailVerification';

interface UseAuthMethodsProps {
  fetchUserProfile: (userId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthMethods = ({ 
  fetchUserProfile, 
  setLoading 
}: UseAuthMethodsProps) => {
  const { signInWithPassword } = useSignInWithPassword({ fetchUserProfile });
  const { signOut } = useSignOut({ setLoading });
  const { signUp } = useSignUp({ fetchUserProfile, setLoading });
  const { checkEmailExists, resendConfirmationEmail } = useEmailVerification({ setLoading });

  return {
    signInWithPassword,
    signOut,
    signUp,
    resendConfirmationEmail,
    checkEmailExists
  };
};
