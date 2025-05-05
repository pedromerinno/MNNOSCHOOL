
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useInitialSession = (
  setSession: (session: Session | null) => void,
  setUser: (user: any) => void,
  setLoading: (loading: boolean) => void,
  checkAndRefreshToken: (session: Session) => Promise<Session | null>
) => {
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting auth session:', error);
          toast.error('Erro ao carregar a sessão: ' + error.message);
        } else if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Check if token needs refresh right away
          const refreshedSession = await checkAndRefreshToken(data.session);
          if (refreshedSession) {
            setSession(refreshedSession);
            setUser(refreshedSession.user);
          }
        }
      } catch (error: any) {
        console.error('Erro ao configurar autenticação:', error);
        toast.error('Erro ao carregar a sessão. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
  }, [setSession, setUser, setLoading, checkAndRefreshToken]);
};
