
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
  signInWithPassword: (email: string, password: string) => Promise<{ data: any, error: Error | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, metadata?: { interests?: string[], company_id?: string }) => Promise<void>;
  updateUserProfile: (userData: Partial<UserProfile>) => Promise<void>;
  updateUserData: (userData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  const { 
    user, 
    session, 
    loading: sessionLoading, 
    setUser, 
    setSession 
  } = useAuthSession();
  
  const { 
    userProfile, 
    fetchUserProfile,
    updateUserProfile,
    updateUserData
  } = useUserProfile();

  const { 
    signInWithPassword, 
    signOut, 
    signUp,
    handleExternalAuth 
  } = useAuthMethods({ 
    fetchUserProfile, 
    setLoading: (isLoading) => setLoading(isLoading)
  });

  // Lidar com a autenticação inicial e possível redirecionamento
  useEffect(() => {
    const checkAuth = async () => {
      // Se já inicializou a autenticação, não refaça o processo
      if (authInitialized) return;
      
      if (user) {
        // Verificar se o usuário acabou de fazer login com Google
        const isExternalAuth = sessionStorage.getItem('external_auth') === 'true';
        
        console.log("AuthContext: Verificando autenticação", {
          userId: user.id,
          isExternalAuth,
          session
        });
        
        if (isExternalAuth) {
          // Limpar flag
          sessionStorage.removeItem('external_auth');
          
          console.log("AuthContext: Detectada autenticação externa, processando...");
          
          // Aguardar um momento para garantir que o perfil foi carregado
          setTimeout(async () => {
            await fetchUserProfile(user.id);
            await handleExternalAuth(session);
            setAuthInitialized(true);
          }, 100);
        } else {
          console.log("AuthContext: Buscando perfil do usuário");
          await fetchUserProfile(user.id);
          setAuthInitialized(true);
        }
      } else {
        setAuthInitialized(true);
      }
    };

    checkAuth();
  }, [user, session, fetchUserProfile, handleExternalAuth, authInitialized]);

  // Debug: Verificar status de admin depois que o perfil é carregado
  useEffect(() => {
    if (userProfile) {
      console.log("AuthContext: Perfil do usuário carregado com status de admin:", {
        is_admin: userProfile.is_admin,
        super_admin: userProfile.super_admin,
      });
    }
  }, [userProfile]);

  const handleUpdateUserData = async (userData: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserData(user.id, userData);
  };

  const value = {
    user,
    session,
    userProfile,
    loading: loading || sessionLoading || !authInitialized,
    signInWithPassword,
    signOut,
    signUp,
    updateUserProfile,
    updateUserData: handleUpdateUserData
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
