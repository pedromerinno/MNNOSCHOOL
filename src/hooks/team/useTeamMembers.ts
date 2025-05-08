
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { UserProfile } from "@/hooks/useUsers";
import { toast } from "sonner";

const CACHE_KEY = 'team_members_cache';
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutos
const BATCH_SIZE = 15; // Tamanho do lote para carregar membros

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
        console.log('Usando dados em cache para membros da equipe');
        return data;
      }
      
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, [selectedCompany]);

  const cacheMembers = useCallback((data: UserProfile[]) => {
    try {
      // Only cache essential data, limiting the size
      const minimalData = data.map(member => ({
        id: member.id,
        display_name: member.display_name,
        email: member.email,
        is_admin: member.is_admin,
        cargo_id: member.cargo_id,
        avatar: member.avatar,
        created_at: member.created_at
      }));

      // Limit the number of entries to cache if there are too many
      const dataToCache = minimalData.length > 50 ? minimalData.slice(0, 50) : minimalData;
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: dataToCache,
        timestamp: Date.now(),
        companyId: selectedCompany?.id
      }));
    } catch (error) {
      console.error('Erro ao cachear membros:', error);
      // Don't throw, just log - we can still function without caching
    }
  }, [selectedCompany]);

  // Função para carregar membros em lotes
  const fetchMembersInBatches = useCallback(async (userIds: string[]): Promise<UserProfile[]> => {
    const allProfiles: UserProfile[] = [];
    const totalBatches = Math.ceil(userIds.length / BATCH_SIZE);
    
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batchIds = userIds.slice(i, i + BATCH_SIZE);
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
      
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email, cargo_id, avatar, is_admin, created_at')
          .in('id', batchIds);

        if (profilesError) throw profilesError;
        
        if (profilesData && profilesData.length > 0) {
          allProfiles.push(...profilesData);
        }
        
        // Atualiza o progresso
        setLoadProgress(Math.round((currentBatch / totalBatches) * 100));
        
      } catch (error) {
        console.error(`Erro ao carregar lote ${currentBatch}/${totalBatches}:`, error);
        // Continue para tentar carregar os outros lotes
      }
      
      // Pequena pausa para evitar sobrecarregar a API
      if (totalBatches > 3 && i + BATCH_SIZE < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return allProfiles;
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMembers = async () => {
      if (!selectedCompany) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        setLoadProgress(0);

        const cachedData = getCachedMembers();
        if (cachedData) {
          setMembers(cachedData);
          setIsLoading(false);
          // Ainda carrega dados atualizados em segundo plano
        } else {
          setIsLoading(true);
        }

        // Buscar relacionamentos usuário-empresa
        const { data: userCompanyRelations, error: relationsError } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', selectedCompany.id);

        if (relationsError) throw relationsError;

        if (!userCompanyRelations || userCompanyRelations.length === 0) {
          if (isMounted) {
            setMembers([]);
            setIsLoading(false);
            setLoadProgress(100);
          }
          return;
        }

        const userIds = userCompanyRelations.map(relation => relation.user_id);
        
        // Fetcha perfis em lotes para evitar problemas de performance
        const allProfiles = await fetchMembersInBatches(userIds);

        if (!isMounted) return;

        const teamMembers: UserProfile[] = allProfiles.map(profile => ({
          id: profile.id,
          display_name: profile.display_name,
          email: profile.email,
          cargo_id: profile.cargo_id,
          avatar: profile.avatar,
          is_admin: profile.is_admin,
          created_at: profile.created_at
        }));

        if (isMounted) {
          setMembers(teamMembers);
          setLoadProgress(100);
          
          // Try to cache, but don't fail if it doesn't work
          try {
            cacheMembers(teamMembers);
          } catch (cacheError) {
            console.warn('Could not cache team members:', cacheError);
          }
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
        if (isMounted) {
          setError(err as Error);
          toast.error("Erro ao carregar membros da equipe");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMembers();
    
    return () => {
      isMounted = false;
    };
  }, [selectedCompany, getCachedMembers, cacheMembers, fetchMembersInBatches]);

  return { members, isLoading, error, loadProgress };
};
