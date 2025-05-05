
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

export const usePeriodicRefresh = (
  session: Session | null,
  checkAndRefreshToken: (session: Session) => Promise<Session | null>,
  setSession: (session: Session | null) => void,
  setUser: (user: any) => void
) => {
  // Setup periodic token refresh
  useEffect(() => {
    if (session) {
      // Initial check when session is set
      const performRefresh = async () => {
        const refreshedSession = await checkAndRefreshToken(session);
        if (refreshedSession) {
          setSession(refreshedSession);
          setUser(refreshedSession.user);
        }
      };
      
      performRefresh();
      
      // Set up interval to check token expiration every minute
      const refreshInterval = setInterval(() => {
        performRefresh();
      }, 60000); // Check every minute
      
      return () => clearInterval(refreshInterval);
    }
  }, [session, checkAndRefreshToken, setSession, setUser]);
};
