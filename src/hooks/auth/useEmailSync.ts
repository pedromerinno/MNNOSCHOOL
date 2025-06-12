
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmailSync = () => {
  // Função para sincronizar email do perfil com email de autenticação
  const syncProfileEmailWithAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id || !user?.email) {
        console.log('Usuário não autenticado ou sem email');
        return { success: false };
      }

      // Verificar se o email do perfil precisa ser atualizado
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      // Se o email do perfil não existe ou é diferente do email de auth, atualiza
      if (!profileData?.email || profileData.email !== user.email) {
        const { error } = await supabase
          .from('profiles')
          .update({ email: user.email })
          .eq('id', user.id);

        if (error) {
          console.error('Erro ao sincronizar email:', error);
          return { success: false, error };
        }

        console.log('Email sincronizado com sucesso');
        return { success: true, updated: true };
      }

      return { success: true, updated: false };
    } catch (error) {
      console.error('Erro ao sincronizar email:', error);
      return { success: false, error };
    }
  }, []);

  // Função para validar se os emails estão sincronizados
  const validateEmailSync = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id || !user?.email) {
        return { synced: false, authEmail: null, profileEmail: null };
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      const synced = profileData?.email === user.email;
      
      return {
        synced,
        authEmail: user.email,
        profileEmail: profileData?.email || null
      };
    } catch (error) {
      console.error('Erro ao validar sincronização de email:', error);
      return { synced: false, authEmail: null, profileEmail: null };
    }
  }, []);

  return {
    syncProfileEmailWithAuth,
    validateEmailSync
  };
};
