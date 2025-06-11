
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { UserProfile } from "@/hooks/useUsers";
import { toast } from "sonner";

const CACHE_KEY = 'team_members_cache';
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutos

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
      
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, [selectedCompany]);

  const cacheMembers = useCallback((data: UserProfile[]) => {
    try {
      // Cache only essential data
      const minimalData = data.map(member => ({
        id: member.id,
        display_name: member.display_name,
        email: member.email,
        is_admin: member.is_admin,
        cargo_id: member.cargo_id,
        avatar: member.avatar,
        created_at: member.created_at
      }));

      // Limit cache size
      const dataToCache = minimalData.length > 50 ? minimalData.slice(0, 50) : minimalData;
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: dataToCache,
        timestamp: Date.now(),
        companyId: selectedCompany?.id
      }));
    } catch (error) {
      console.error('Error caching team members:', error);
    }
  }, [selectedCompany]);

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

        // Use cached data immediately if available
        const cachedData = getCachedMembers();
        if (cachedData) {
          setMembers(cachedData);
          setIsLoading(false);
          setLoadProgress(100);
          return; // Don't fetch fresh data if we have cache
        } else {
          setIsLoading(true);
        }

        // Single optimized query with join
        const { data: teamData, error: teamError } = await supabase
          .from('user_empresa')
          .select(`
            user_id,
            profiles!inner(
              id, 
              display_name, 
              email, 
              cargo_id, 
              avatar, 
              is_admin, 
              created_at
            )
          `)
          .eq('empresa_id', selectedCompany.id);

        if (teamError) throw teamError;

        if (!isMounted) return;

        // Extract team members from join result
        const teamMembers: UserProfile[] = teamData?.map((item: any) => ({
          id: item.profiles.id,
          display_name: item.profiles.display_name,
          email: item.profiles.email,
          cargo_id: item.profiles.cargo_id,
          avatar: item.profiles.avatar,
          is_admin: item.profiles.is_admin,
          created_at: item.profiles.created_at
        })) || [];

        if (isMounted) {
          setMembers(teamMembers);
          setLoadProgress(100);
          cacheMembers(teamMembers);
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
  }, [selectedCompany, getCachedMembers, cacheMembers]);

  return { members, isLoading, error, loadProgress };
};
