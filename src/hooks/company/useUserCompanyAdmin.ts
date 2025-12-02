import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanies } from '@/hooks/useCompanies';

/**
 * Hook para verificar se o usuário é admin de uma empresa específica
 */
export const useUserCompanyAdmin = (userId?: string) => {
  const { selectedCompany } = useCompanies();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!selectedCompany?.id) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Se userId não foi fornecido, usar o usuário atual
        const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
        
        if (!targetUserId) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Verificar se é super admin primeiro
        const { data: profile } = await supabase
          .from('profiles')
          .select('super_admin')
          .eq('id', targetUserId)
          .single();

        if (profile?.super_admin) {
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        // Verificar se é admin da empresa (is_admin foi removido de profiles)
        const { data: userCompany, error } = await supabase
          .from('user_empresa')
          .select('is_admin')
          .eq('user_id', targetUserId)
          .eq('empresa_id', selectedCompany.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(userCompany?.is_admin || false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [selectedCompany?.id, userId]);

  return {
    isAdmin,
    isLoading,
  };
};

