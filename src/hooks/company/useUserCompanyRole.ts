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

        console.log('[useUserCompanyRole] Fetching role for:', { targetUserId, empresaId: selectedCompany.id });

        // Usar a view otimizada que já traz tudo combinado (profile + user_empresa + job_roles)
        // Muito mais eficiente que múltiplas queries
        const { data: companyUsers, error: viewError } = await supabase
          .rpc('get_company_users', { _empresa_id: selectedCompany.id });

        console.log('[useUserCompanyRole] get_company_users RPC result:', { 
          usersCount: companyUsers?.length || 0, 
          error: viewError 
        });

        if (viewError) {
          console.error('[useUserCompanyRole] Error fetching from view:', viewError);
          throw viewError;
        }

        // Encontrar o usuário específico na lista retornada pela view
        const userData = companyUsers?.find((user: any) => user.id === targetUserId);

        if (userData) {
          console.log('[useUserCompanyRole] User found in view:', {
            id: userData.id,
            cargo_id: userData.cargo_id,
            cargo_title: userData.cargo_title,
            is_admin: userData.is_admin
          });

          setCargoId(userData.cargo_id || null);
          setIsAdmin(userData.is_admin || false);

          // Se tem cargo, criar objeto jobRole com os dados da view
          if (userData.cargo_id && userData.cargo_title) {
            // A view já traz o cargo_title, então criamos um objeto jobRole básico
            // Se precisar de mais detalhes, podemos fazer query adicional apenas se necessário
            const roleData = {
              id: userData.cargo_id,
              title: userData.cargo_title,
              company_id: selectedCompany.id
            };
            
            console.log('[useUserCompanyRole] Job role set from view:', roleData);
            setJobRole(roleData);
            
            // Opcional: Buscar detalhes completos do cargo se necessário
            // Por enquanto, usamos os dados da view que já são suficientes
          } else {
            console.log('[useUserCompanyRole] No cargo_id or cargo_title found, setting jobRole to null');
            setJobRole(null);
          }
        } else {
          console.log('[useUserCompanyRole] User not found in company users list');
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

