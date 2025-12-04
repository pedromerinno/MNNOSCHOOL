
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useUserProfile } from '@/hooks/auth/useUserProfile';
import { useAuthMethods } from '@/hooks/auth/useAuthMethods';
import { useEmailSync } from '@/hooks/auth/useEmailSync';
import { useCache } from '@/hooks/useCache';

interface AuthContextType {
  user: any;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  refreshError: Error | null;
  signInWithPassword: (email: string, password: string) => Promise<{ data: any, error: Error | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, metadata?: { interests?: string[] }) => Promise<any>;
  updateUserProfile: (userData: Partial<UserProfile>) => Promise<void>;
  updateUserData: (userData: Partial<UserProfile>) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean, error: any }>;
  syncProfileEmailWithAuth: () => Promise<{ success: boolean, updated?: boolean, error?: any }>;
  validateEmailSync: () => Promise<{ synced: boolean, authEmail: string | null, profileEmail: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { 
    user, 
    session, 
    loading: sessionLoading, 
    setUser, 
    setSession,
    refreshError
  } = useAuthSession();
  
  const { 
    userProfile, 
    isLoading: profileLoading,
    fetchUserProfile,
    updateUserProfile,
    updateUserData,
    clearProfile
  } = useUserProfile();

  const { 
    signInWithPassword, 
    signOut: handleSignOut, 
    signUp,
    resendConfirmationEmail 
  } = useAuthMethods({ 
    fetchUserProfile, 
    setLoading: (isLoading) => setLoading(isLoading)
  });

  const { syncProfileEmailWithAuth, validateEmailSync } = useEmailSync();
  const { getCache, setCache, clearCache } = useCache();
  const USER_PROFILE_CACHE_KEY = 'user_profile';
  const lastFetchedUserIdRef = React.useRef<string | null>(null);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasAttemptedFetchRef = React.useRef<boolean>(false);

  // Load user profile when user changes and sync email
  // Otimizado: sincronização de email e busca de perfil em paralelo para melhor performance
  // Com debounce para evitar múltiplas buscas
  useEffect(() => {
    // Limpar timeout anterior se existir
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    if (!user?.id) {
      console.log('[AuthContext] No user, clearing profile');
      lastFetchedUserIdRef.current = null;
      hasAttemptedFetchRef.current = false;
      clearProfile();
      return;
    }

    // Se já temos perfil para este usuário, não buscar novamente
    if (lastFetchedUserIdRef.current === user.id && userProfile?.id === user.id) {
      console.log('[AuthContext] Profile already loaded for this user, skipping...');
      return;
    }

    // Se já tentamos buscar para este usuário e ainda está carregando, aguardar
    if (lastFetchedUserIdRef.current === user.id && profileLoading) {
      console.log('[AuthContext] Profile fetch already in progress, waiting...');
      return;
    }

    // Se já tentamos buscar e não temos perfil, não tentar novamente automaticamente
    // (evita loops infinitos - o perfil pode não existir ainda ou haver erro de RLS)
    if (lastFetchedUserIdRef.current === user.id && hasAttemptedFetchRef.current && !userProfile) {
      console.log('[AuthContext] Already attempted fetch for this user, not retrying automatically');
      return;
    }

    // Debounce reduzido para carregamento mais rápido (50ms é suficiente para evitar múltiplas requisições)
    console.log('[AuthContext] Scheduling profile fetch for user:', user.id);
    fetchTimeoutRef.current = setTimeout(() => {
      console.log('[AuthContext] Starting profile fetch for user:', user.id);
      lastFetchedUserIdRef.current = user.id;
      hasAttemptedFetchRef.current = true;

      // Executar busca de perfil (crítico) - priorizar perfil sobre email sync
      // Buscar perfil primeiro, email sync pode ser feito em background
      fetchUserProfile(user.id, false).then(() => {
        console.log('[AuthContext] Profile fetch completed for user:', user.id);
        // Email sync em background após perfil carregado
        syncProfileEmailWithAuth().then(result => {
          if (result?.error?.code === '42P17') {
            return; // Silencioso
          }
          if (!result?.success && result?.error) {
            console.warn('[AuthContext] Email sync failed (non-critical):', result.error);
          } else if (result?.success) {
            console.log('[AuthContext] Email sync successful');
          }
        }).catch(err => {
          if (err?.code !== '42P17') {
            console.warn('[AuthContext] Email sync failed (non-critical):', err);
          }
        });
      }).catch(err => {
        // Se for erro de RLS, não é crítico - aplicação pode funcionar sem perfil
        if (err?.code !== '42P17') {
          console.error('[AuthContext] Error fetching user profile:', err);
        } else {
          console.warn('[AuthContext] RLS error when fetching profile (expected in some cases)');
        }
      });
    }, 50); // Debounce reduzido para 50ms - carregamento mais rápido

    // Cleanup: limpar timeout se o componente desmontar ou user mudar
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Function to sign out and clear data
  const signOut = async () => {
    // Limpar timeouts
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    
    clearCache({ key: USER_PROFILE_CACHE_KEY });
    clearProfile();
    lastFetchedUserIdRef.current = null;
    hasAttemptedFetchRef.current = false;
    
    // Clear company-related localStorage items for security
    try {
      localStorage.removeItem('selectedCompanyId');
      localStorage.removeItem('selectedCompany');
      // Clear user profile cache
      if (user?.id) {
        localStorage.removeItem(`profile_${user.id}`);
      }
    } catch (error) {
      console.warn('Error clearing localStorage on logout:', error);
    }
    
    await handleSignOut();
  };

  // Wrapper promisified for updateUserProfile
  const handleUpdateUserProfile = async (userData: Partial<UserProfile>): Promise<void> => {
    return Promise.resolve(updateUserProfile(userData));
  };

  const handleUpdateUserData = async (userData: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserData(user.id, userData);
  };

  const value = {
    user,
    session,
    userProfile,
    loading: loading || sessionLoading,
    profileLoading,
    refreshError,
    signInWithPassword,
    signOut,
    signUp,
    updateUserProfile: handleUpdateUserProfile,
    updateUserData: handleUpdateUserData,
    resendConfirmationEmail,
    syncProfileEmailWithAuth,
    validateEmailSync
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
