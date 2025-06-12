
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { UserProfile } from "@/hooks/useUsers";
import { toast } from "sonner";

const CACHE_KEY = 'team_members_cache';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos (reduzido)

export const useTeamMembers = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { selectedCompany } = useCompanies();
  const [loadProgress, setLoadProgress] = useState(0);

  const getCachedMembers = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp, companyId } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp < CACHE_EXPIRATION && companyId === selectedCompany?.id) {
        console.log('Using cached team members data');
        return data;
      }
      
      // Limpar cache expirado
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.warn('Error reading cached team members:', error);
      // Limpar cache corrompido
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch (e) {
        console.warn('Could not clear corrupted cache:', e);
      }
      return null;
    }
  }, [selectedCompany?.id]);

  const cacheMembers = useCallback((data: UserProfile[]) => {
    if (!selectedCompany?.id || data.length === 0) return;
    
    try {
      // Criar dados minimalistas para cache
      const minimalData = data.slice(0, 20).map(member => ({
        id: member.id,
        display_name: member.display_name,
        email: member.email,
        is_admin: member.is_admin,
        avatar: member.avatar,
        created_at: member.created_at
      }));
      
      const cacheData = {
        data: minimalData,
        timestamp: Date.now(),
        companyId: selectedCompany.id
      };
      
      // Verificar tamanho do cache antes de salvar
      const cacheString = JSON.stringify(cacheData);
      if (cacheString.length > 500000) { // ~500KB limit
        console.warn('Cache too large, skipping cache for team members');
        return;
      }
      
      localStorage.setItem(CACHE_KEY, cacheString);
      console.log('[useTeamMembers] Team members cached successfully');
    } catch (error) {
      console.warn('[useTeamMembers] Error caching team members:', error);
      // Se falhar por quota, tentar limpar outros caches
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        try {
          // Limpar caches antigos
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('cache')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.warn('Could not remove cache key:', key);
            }
          });
        } catch (e) {
          console.warn('Could not clear localStorage:', e);
        }
      }
    }
  }, [selectedCompany?.id]);

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    
    const fetchMembers = async () => {
      if (!selectedCompany?.id) {
        setMembers([]);
        setIsLoading(false);
        setLoadProgress(100);
        return;
      }

      try {
        setError(null);
        setLoadProgress(10);

        // Tentar usar cache primeiro
        const cachedData = getCachedMembers();
        if (cachedData && cachedData.length > 0) {
          setMembers(cachedData);
          setIsLoading(false);
          setLoadProgress(100);
          return;
        }

        setIsLoading(true);
        setLoadProgress(30);

        // Buscar dados frescos com timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 10000);
        });

        const queryPromise = supabase
          .from('user_empresa')
          .select(`
            user_id,
            profiles!inner(
              id, 
              display_name, 
              email, 
              is_admin, 
              avatar, 
              created_at
            )
          `)
          .eq('empresa_id', selectedCompany.id)
          .abortSignal(abortController.signal);

        setLoadProgress(60);

        const { data: teamData, error: teamError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;

        if (teamError) throw teamError;
        if (!isMounted) return;

        setLoadProgress(80);

        // Processar dados
        const teamMembers: UserProfile[] = teamData?.map((item: any) => ({
          id: item.profiles.id,
          display_name: item.profiles.display_name,
          email: item.profiles.email,
          is_admin: item.profiles.is_admin,
          avatar: item.profiles.avatar,
          created_at: item.profiles.created_at
        })) || [];

        if (isMounted) {
          setMembers(teamMembers);
          setLoadProgress(100);
          // Cache apenas se tiver dados
          if (teamMembers.length > 0) {
            cacheMembers(teamMembers);
          }
        }
      } catch (err: any) {
        console.error('Error fetching team members:', err);
        if (isMounted) {
          if (err.message === 'Timeout') {
            setError(new Error('Carregamento demorou muito. Tente novamente.'));
            toast.error("Tempo limite excedido ao carregar membros da equipe");
          } else {
            setError(err as Error);
            toast.error("Erro ao carregar membros da equipe");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setLoadProgress(100);
        }
      }
    };

    fetchMembers();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [selectedCompany?.id, getCachedMembers, cacheMembers]);

  return { members, isLoading, error, loadProgress };
};
