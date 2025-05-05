
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRefreshErrorHandler = (
  refreshError: Error | null,
  setRefreshError: (error: Error | null) => void,
  session: Session | null,
  setSession: (session: Session | null) => void,
  setUser: (user: any) => void
) => {
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
  }, [refreshError, session, setSession, setUser, setRefreshError]);
};
