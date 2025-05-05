
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthStateListener = (
  setSession: (session: Session | null) => void,
  setUser: (user: any) => void,
  checkAndRefreshToken: (session: Session) => Promise<Session | null>
) => {
  useEffect(() => {
    const setupAuthListener = async () => {
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
      
      return subscription;
    };

    const subscription = setupAuthListener();
    
    return () => {
      subscription.then(sub => sub.unsubscribe());
    };
  }, [setSession, setUser, checkAndRefreshToken]);
};
