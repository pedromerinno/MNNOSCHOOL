
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthSession = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshError, setRefreshError] = useState<Error | null>(null);

  // Check token expiration and refresh if necessary
  const checkAndRefreshToken = useCallback(async (currentSession: Session) => {
    if (!currentSession) return;
    
    try {
      // Calculate time until expiration (in seconds)
      const expiresAt = currentSession.expires_at;
      if (!expiresAt) return;
      
      const expiresAtDate = new Date(expiresAt * 1000);
      const now = new Date();
      
      // If token expires in less than 5 minutes (300 seconds), refresh it
      const timeUntilExpire = (expiresAtDate.getTime() - now.getTime()) / 1000;
      
      // Refresh token if it expires in less than 5 minutes
      if (timeUntilExpire < 300) {
        console.log('Auth token expiring soon, refreshing...');
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Error refreshing token:', error);
          setRefreshError(error);
          return;
        }
        
        if (data?.session) {
          console.log('Token refreshed successfully');
          setSession(data.session);
          setUser(data.session.user);
        }
      }
    } catch (error) {
      console.error('Error in token refresh check:', error);
    }
  }, []);
  
  // Setup periodic token refresh
  useEffect(() => {
    if (session) {
      // Initial check when session is set
      checkAndRefreshToken(session);
      
      // Set up interval to check token expiration every minute
      const refreshInterval = setInterval(() => {
        checkAndRefreshToken(session);
      }, 60000); // Check every minute
      
      return () => clearInterval(refreshInterval);
    }
  }, [session, checkAndRefreshToken]);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        setLoading(true);
        
        // First set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log(`Auth event: ${event}`);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              console.log('User signed in or token refreshed');
              setSession(newSession);
              setUser(newSession?.user || null);
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              setSession(null);
              setUser(null);
            } else if (event === 'USER_UPDATED') {
              console.log('User updated');
              setSession(newSession);
              setUser(newSession?.user || null);
            }
          }
        );
        
        // Then get the initial session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting auth session:', error);
          toast.error('Erro ao carregar a sessão: ' + error.message);
        } else if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Check if token needs refresh right away
          checkAndRefreshToken(data.session);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error: any) {
        console.error('Erro ao configurar autenticação:', error);
        toast.error('Erro ao carregar a sessão. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    setupAuth();
  }, [checkAndRefreshToken]);

  // Handle refresh errors
  useEffect(() => {
    if (refreshError) {
      // If we have persistent refresh errors, show a more prominent notification
      toast.error('Erro ao renovar sua sessão. Você pode ser desconectado em breve.', {
        duration: 10000, // Show for 10 seconds
        action: {
          label: 'Reconectar',
          onClick: async () => {
            setRefreshError(null);
            if (session) {
              try {
                const { data, error } = await supabase.auth.refreshSession();
                if (error) throw error;
                if (data?.session) {
                  setSession(data.session);
                  setUser(data.session.user);
                  toast.success('Sessão renovada com sucesso');
                }
              } catch (error: any) {
                console.error('Failed to manually refresh session:', error);
                toast.error('Falha ao reconectar. Por favor, faça login novamente.');
              }
            }
          }
        }
      });
    }
  }, [refreshError, session]);

  return {
    user,
    session,
    loading,
    setUser,
    setSession,
    refreshError
  };
};
