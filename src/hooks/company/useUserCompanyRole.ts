import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanies } from './useCompanies';

/**
 * Hook para obter o cargo do usuário na empresa selecionada
 */
export const useUserCompanyRole = (userId?: string) => {
  const { selectedCompany } = useCompanies();
  const [cargoId, setCargoId] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserCompanyRole = async () => {
      if (!selectedCompany?.id) {
        setCargoId(null);
        setJobRole(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Se userId não foi fornecido, usar o usuário atual
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!targetUserId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Buscar a associação do usuário com a empresa
        const { data: userCompany, error: userCompanyError } = await supabase
          .from('user_empresa')
          .select('cargo_id, is_admin')
          .eq('user_id', targetUserId)
          .eq('empresa_id', selectedCompany.id)
          .single();

        if (userCompanyError && userCompanyError.code !== 'PGRST116') {
          throw userCompanyError;
        }

        if (userCompany) {
          setCargoId(userCompany.cargo_id || null);
          setIsAdmin(userCompany.is_admin || false);

          // Se tem cargo, buscar os detalhes
          if (userCompany.cargo_id) {
            const { data: roleData, error: roleError } = await supabase
              .from('job_roles')
              .select('*')
              .eq('id', userCompany.cargo_id)
              .single();

            if (roleError && roleError.code !== 'PGRST116') {
              console.error('Error fetching job role:', roleError);
            } else {
              setJobRole(roleData || null);
            }
          } else {
            setJobRole(null);
          }
        } else {
          setCargoId(null);
          setJobRole(null);
          setIsAdmin(false);
        }
      } catch (err: any) {
        console.error('Error fetching user company role:', err);
        setError(err);
        setCargoId(null);
        setJobRole(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCompanyRole();
  }, [selectedCompany?.id, userId]);

  return {
    cargoId,
    jobRole,
    isAdmin,
    isLoading,
    error,
  };
};

