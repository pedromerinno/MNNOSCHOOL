
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useUserProfile } from '@/hooks/auth/useUserProfile';
import { useAuthMethods } from '@/hooks/auth/useAuthMethods';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chave para o cache local
const USER_PROFILE_CACHE_KEY = 'user_profile_cache';
const PROFILE_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

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

  // Carregar perfil de cache ao inicializar
  useEffect(() => {
    const loadCachedProfile = () => {
      try {
        const cachedData = localStorage.getItem(USER_PROFILE_CACHE_KEY);
        if (cachedData) {
          const { profile, timestamp, userId } = JSON.parse(cachedData);
          const now = Date.now();
          
          if (now - timestamp < PROFILE_CACHE_EXPIRY && userId === user?.id) {
            console.log('Usando perfil em cache enquanto carrega dados atualizados');
            updateUserProfile(profile);
          } else {
            // Cache expirou ou mudou de usuário
            localStorage.removeItem(USER_PROFILE_CACHE_KEY);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar perfil do cache:', e);
      }
    };
    
    if (user) {
      loadCachedProfile();
      fetchUserProfile(user.id);
    } else {
      clearProfile();
    }
  }, [user, fetchUserProfile, updateUserProfile, clearProfile]);

  // Salvar perfil em cache quando disponível
  useEffect(() => {
    if (userProfile && user) {
      try {
        const cacheData = {
          profile: userProfile,
          timestamp: Date.now(),
          userId: user.id
        };
        localStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(cacheData));
      } catch (e) {
        console.error('Erro ao salvar perfil em cache:', e);
      }
    }
  }, [userProfile, user]);

  // Função de signOut personalizada que limpa o cache
  const signOut = async () => {
    localStorage.removeItem(USER_PROFILE_CACHE_KEY);
    clearProfile();
    await handleSignOut();
  };

  // Wrapper promisificado para updateUserProfile
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
    resendConfirmationEmail
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
