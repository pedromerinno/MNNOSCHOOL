
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/useUsers";

// Tipo estendido para incluir informações de user_empresa
export interface TeamMember extends UserProfile {
  is_admin?: boolean; // Admin desta empresa específica
  cargo_id?: string | null; // Cargo nesta empresa específica
}

interface UseTeamMembersOptimizedProps {
  selectedCompanyId?: string;
  skipLoading?: boolean;
}

export const useTeamMembersOptimized = ({ 
  selectedCompanyId, 
  skipLoading = false 
}: UseTeamMembersOptimizedProps = {}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
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

      // Query otimizada incluindo informações do cargo e admin de user_empresa
      const { data: teamData, error: teamError } = await supabase
        .from('user_empresa')
        .select(`
          user_id,
          is_admin,
          cargo_id,
          profiles!inner(
            id, 
            display_name, 
            email, 
            avatar, 
            created_at,
            super_admin
          ),
          job_roles(
            id,
            title
          )
        `)
        .eq('empresa_id', companyId)
        .abortSignal(signal);

      if (teamError) throw teamError;

      console.log('[useTeamMembersOptimized] Dados recebidos:', teamData?.length || 0, 'membros');

      const teamMembers: TeamMember[] = teamData?.map((item: any) => {
        const profile = item.profiles;
        return {
          id: profile.id,
          display_name: profile.display_name,
          email: profile.email,
          // is_admin e cargo_id agora vêm de user_empresa
          is_admin: item.is_admin || false,
          cargo_id: item.cargo_id || null,
          avatar: profile.avatar,
          created_at: profile.created_at,
          super_admin: profile.super_admin,
          // roleName vem de job_roles
          roleName: item.job_roles?.title || null
        };
      }) || [];

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
