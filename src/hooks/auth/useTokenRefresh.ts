
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useTokenRefresh = (session: Session | null) => {
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
          return null;
        }
        
        if (data?.session) {
          console.log('Token refreshed successfully');
          return data.session;
        }
      }
      return null;
    } catch (error) {
      console.error('Error in token refresh check:', error);
      return null;
    }
  }, []);

  return { refreshError, checkAndRefreshToken, setRefreshError };
};
