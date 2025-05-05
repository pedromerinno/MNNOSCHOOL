
import React, { createContext, useState, useContext } from 'react';
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
  refreshError: Error | null;
  signInWithPassword: (email: string, password: string) => Promise<{ data: any, error: Error | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, metadata?: { interests?: string[] }) => Promise<any>;
  updateUserProfile: (userData: Partial<UserProfile>) => Promise<void>;
  updateUserData: (userData: Partial<UserProfile>) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean, error: any }>;
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
    fetchUserProfile,
    updateUserProfile,
    updateUserData
  } = useUserProfile();

  const { 
    signInWithPassword, 
    signOut, 
    signUp,
    resendConfirmationEmail 
  } = useAuthMethods({ 
    fetchUserProfile, 
    setLoading: (isLoading) => setLoading(isLoading)
  });

  React.useEffect(() => {
    if (user) {
      setTimeout(async () => {
        await fetchUserProfile(user.id);
      }, 0);
    }
  }, [user, fetchUserProfile]);

  const handleUpdateUserData = async (userData: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserData(user.id, userData);
  };

  const value = {
    user,
    session,
    userProfile,
    loading: loading || sessionLoading,
    refreshError,
    signInWithPassword,
    signOut,
    signUp,
    updateUserProfile,
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
