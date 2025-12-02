
import { useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';

export const usePeriodicRefresh = (
  session: Session | null,
  checkAndRefreshToken: (session: Session) => Promise<Session | null>,
  setSession: (session: Session | null) => void,
  setUser: (user: any) => void
) => {
  // Use refs to store latest functions to avoid recreating interval
  const checkAndRefreshTokenRef = useRef(checkAndRefreshToken);
  const setSessionRef = useRef(setSession);
  const setUserRef = useRef(setUser);
  const sessionRef = useRef(session);

  // Update refs when values change
  useEffect(() => {
    checkAndRefreshTokenRef.current = checkAndRefreshToken;
    setSessionRef.current = setSession;
    setUserRef.current = setUser;
    sessionRef.current = session;
  }, [checkAndRefreshToken, setSession, setUser, session]);

  // Setup periodic token refresh - only recreate when session changes
  useEffect(() => {
    if (session) {
      // Initial check when session is set
      const performRefresh = async () => {
        const currentSession = sessionRef.current;
        if (!currentSession) return;
        
        const refreshedSession = await checkAndRefreshTokenRef.current(currentSession);
        if (refreshedSession) {
          setSessionRef.current(refreshedSession);
          setUserRef.current(refreshedSession.user);
        }
      };
      
      performRefresh();
      
      // Set up interval to check token expiration every minute
      const refreshInterval = setInterval(() => {
        performRefresh();
      }, 60000); // Check every minute
      
      return () => clearInterval(refreshInterval);
    }
  }, [session?.access_token]); // Only depend on access_token, not the whole session object
};
