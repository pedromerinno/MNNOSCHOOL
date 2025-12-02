
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

  // Load user profile when user changes and sync email
  // Otimizado: sincronização de email e busca de perfil em paralelo para melhor performance
  useEffect(() => {
    if (user) {
      // Executar busca de perfil (crítico)
      // Sincronização de email em paralelo (não crítico, pode falhar silenciosamente)
      // Usar Promise.allSettled para não bloquear uma pela outra
      Promise.allSettled([
        syncProfileEmailWithAuth().then(result => {
          // Se retornou erro de RLS, não logar (é esperado)
          if (result?.error?.code === '42P17') {
            return; // Silencioso
          }
          if (!result?.success && result?.error) {
            console.warn('Email sync failed (non-critical):', result.error);
          }
        }).catch(err => {
          // Se for erro de RLS, não logar (é esperado)
          if (err?.code !== '42P17') {
            console.warn('Email sync failed (non-critical):', err);
          }
        }),
        fetchUserProfile(user.id).catch(err => {
          // Se for erro de RLS, não é crítico - aplicação pode funcionar sem perfil
          if (err?.code !== '42P17') {
            console.error('Error fetching user profile:', err);
          }
        })
      ]);
    } else {
      clearProfile();
    }
  }, [user, fetchUserProfile, clearProfile, syncProfileEmailWithAuth]);

  // Function to sign out and clear data
  const signOut = async () => {
    clearCache({ key: USER_PROFILE_CACHE_KEY });
    clearProfile();
    
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
