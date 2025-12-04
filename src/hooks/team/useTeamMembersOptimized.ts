
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

const CACHE_KEY_PREFIX = 'team_members_';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

export const useTeamMembersOptimized = ({ 
  selectedCompanyId, 
  skipLoading = false 
}: UseTeamMembersOptimizedProps = {}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(!skipLoading);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchedCompanyId = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Funções de cache usando refs para evitar recriação
  const getCachedMembersRef = useRef((companyId: string): TeamMember[] | null => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${companyId}`;
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp < CACHE_EXPIRATION) {
        console.log('[useTeamMembersOptimized] Usando cache para empresa:', companyId);
        return data;
      }
      
      // Cache expirado, remover
      localStorage.removeItem(cacheKey);
      return null;
    } catch (e) {
      console.warn('[useTeamMembersOptimized] Erro ao ler cache:', e);
      return null;
    }
  });

  const setCachedMembersRef = useRef((companyId: string, data: TeamMember[]) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${companyId}`;
      
      // Reduzir tamanho dos dados: não salvar avatares base64 completos (muito grandes)
      const lightweightData = data.map(member => ({
        id: member.id,
        display_name: member.display_name,
        email: member.email,
        // Não salvar avatar base64 completo - apenas flag se tem avatar
        hasAvatar: !!member.avatar,
        created_at: member.created_at,
        super_admin: member.super_admin || false,
        is_admin: member.is_admin || false,
        cargo_id: member.cargo_id || null,
        roleName: member.roleName || null
      }));
      
      localStorage.setItem(cacheKey, JSON.stringify({
        data: lightweightData,
        timestamp: Date.now()
      }));
    } catch (e: any) {
      // Se for erro de quota, limpar cache antigo e tentar novamente
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn('[useTeamMembersOptimized] Cache cheio, limpando cache antigo');
        try {
          // Limpar todos os caches de team_members
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith(CACHE_KEY_PREFIX)) {
              localStorage.removeItem(key);
            }
          });
          // Tentar salvar novamente sem avatares
          const lightweightData = data.map(member => ({
            id: member.id,
            display_name: member.display_name,
            email: member.email,
            hasAvatar: !!member.avatar,
            created_at: member.created_at,
            super_admin: member.super_admin || false,
            is_admin: member.is_admin || false,
            cargo_id: member.cargo_id || null,
            roleName: member.roleName || null
          }));
          localStorage.setItem(cacheKey, JSON.stringify({
            data: lightweightData,
            timestamp: Date.now()
          }));
        } catch (retryError) {
          console.warn('[useTeamMembersOptimized] Erro ao salvar cache após limpeza:', retryError);
        }
      } else {
        console.warn('[useTeamMembersOptimized] Erro ao salvar cache:', e);
      }
    }
  });

  const fetchTeamMembers = useCallback(async (companyId: string) => {
    // Evitar fetch duplicado
    if (lastFetchedCompanyId.current === companyId && isFetchingRef.current) {
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
      isFetchingRef.current = true;

      console.log('[useTeamMembersOptimized] Buscando membros para empresa:', companyId);

      // Usar função RPC otimizada get_company_users que faz tudo em uma única query
      // Esta função já está otimizada com índices e faz JOIN interno no banco
      // Muito mais rápido que fazer 2 queries separadas
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_company_users', { _empresa_id: companyId })
        .abortSignal(signal);

      if (usersError) throw usersError;

      if (!usersData || usersData.length === 0) {
        console.log('[useTeamMembersOptimized] Nenhum membro encontrado na empresa');
        setMembers([]);
        setCachedMembersRef.current(companyId, []);
        return;
      }

      console.log('[useTeamMembersOptimized] Dados recebidos:', usersData.length, 'membros');

      // Transformar dados da RPC para formato TeamMember
      // A RPC já retorna tudo combinado, então só precisamos mapear
      const teamMembers: TeamMember[] = usersData.map((user: any) => ({
        id: user.id,
        display_name: user.display_name,
        email: user.email,
        avatar: user.avatar,
        created_at: user.created_at,
        super_admin: user.super_admin || false,
        is_admin: user.is_admin || false,
        cargo_id: user.cargo_id || null,
        roleName: user.cargo_title || null
      }));

      setMembers(teamMembers);
      // Não salvar no cache para evitar problemas de quota (avatares base64 são muito grandes)
      // setCachedMembersRef.current(companyId, teamMembers);
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
      isFetchingRef.current = false;
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
