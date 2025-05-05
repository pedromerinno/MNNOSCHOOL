
import { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useTokenRefresh } from './useTokenRefresh';
import { useAuthStateListener } from './useAuthStateListener';
import { useInitialSession } from './useInitialSession';
import { useRefreshErrorHandler } from './useRefreshErrorHandler';
import { usePeriodicRefresh } from './usePeriodicRefresh';

export const useAuthSession = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Hook for token refresh functionality
  const { refreshError, checkAndRefreshToken, setRefreshError } = useTokenRefresh(session);
  
  // Hook for handling auth state changes
  useAuthStateListener(setSession, setUser, checkAndRefreshToken);
  
  // Hook for initial session setup
  useInitialSession(setSession, setUser, setLoading, checkAndRefreshToken);
  
  // Hook for handling refresh errors
  useRefreshErrorHandler(refreshError, setRefreshError, session, setSession, setUser);
  
  // Hook for periodic token refresh
  usePeriodicRefresh(session, checkAndRefreshToken, setSession, setUser);

  return {
    user,
    session,
    loading,
    setUser,
    setSession,
    refreshError
  };
};
