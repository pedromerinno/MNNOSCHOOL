
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthSession = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        setLoading(true);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log(`Auth event: ${event}`);
            
            setSession(newSession);
            setUser(newSession?.user || null);
          }
        );
        
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao configurar autenticação:', error);
        toast.error('Erro ao carregar a sessão. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  return {
    user,
    session,
    loading,
    setUser,
    setSession
  };
};
