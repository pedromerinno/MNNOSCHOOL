
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/useUsers";

interface UseTeamMembersOptimizedProps {
  selectedCompanyId?: string;
  skipLoading?: boolean;
}

export const useTeamMembersOptimized = ({ 
  selectedCompanyId, 
  skipLoading = false 
}: UseTeamMembersOptimizedProps = {}) => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(!skipLoading);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchedCompanyId = useRef<string | null>(null);

  const fetchTeamMembers = useCallback(async (companyId: string) => {
    // Evitar fetch duplicado
    if (lastFetchedCompanyId.current === companyId) {
      console.log('[useTeamMembersOptimized] Evitando fetch duplicado para empresa:', companyId);
      return;
    }

    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setIsLoading(true);
      setError(null);
      lastFetchedCompanyId.current = companyId;

      console.log('[useTeamMembersOptimized] Buscando membros para empresa:', companyId);

      // Query otimizada incluindo informações do cargo
      const { data: teamData, error: teamError } = await supabase
        .from('user_empresa')
        .select(`
          user_id,
          profiles!inner(
            id, 
            display_name, 
            email, 
            is_admin, 
            avatar, 
            created_at,
            cargo_id,
            job_roles(
              id,
              title
            )
          )
        `)
        .eq('empresa_id', companyId)
        .abortSignal(signal);

      if (teamError) throw teamError;

      console.log('[useTeamMembersOptimized] Dados recebidos:', teamData?.length || 0, 'membros');

      const teamMembers: UserProfile[] = teamData?.map((item: any) => ({
        id: item.profiles.id,
        display_name: item.profiles.display_name,
        email: item.profiles.email,
        is_admin: item.profiles.is_admin,
        avatar: item.profiles.avatar,
        created_at: item.profiles.created_at,
        cargo_id: item.profiles.cargo_id
      })) || [];

      setMembers(teamMembers);
      console.log('[useTeamMembersOptimized] Membros carregados com sucesso:', teamMembers.length);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[useTeamMembersOptimized] Fetch cancelado');
        return;
      }
      
      console.error('[useTeamMembersOptimized] Erro ao carregar membros:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetMembers = useCallback(() => {
    setMembers([]);
    setError(null);
    lastFetchedCompanyId.current = null;
  }, []);

  // Fetch quando a empresa mudar
  useEffect(() => {
    if (skipLoading || !selectedCompanyId) {
      resetMembers();
      setIsLoading(false);
      return;
    }

    fetchTeamMembers(selectedCompanyId);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedCompanyId, skipLoading, fetchTeamMembers, resetMembers]);

  return {
    members,
    isLoading,
    error,
    refetch: () => selectedCompanyId && fetchTeamMembers(selectedCompanyId)
  };
};
