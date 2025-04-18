
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { UserProfile } from "@/hooks/useUsers";
import { toast } from "sonner";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

type TeamMembersCache = {
  companyId: string;
  members: UserProfile[];
  timestamp: number;
};

export const useTeamMembers = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { selectedCompany } = useCompanies();

  // Cache management functions
  const getCachedMembers = useCallback((): TeamMembersCache | null => {
    if (!selectedCompany?.id) return null;
    
    try {
      const cached = localStorage.getItem(`teamMembersCache_${selectedCompany.id}`);
      if (!cached) return null;

      const cache = JSON.parse(cached) as TeamMembersCache;
      const now = Date.now();
      
      // Check if cache is valid and for the current company
      if (
        cache && 
        cache.companyId === selectedCompany.id && 
        now - cache.timestamp < CACHE_DURATION
      ) {
        return cache;
      }
      
      return null;
    } catch (err) {
      console.error('Error reading team members cache:', err);
      return null;
    }
  }, [selectedCompany?.id]);

  const setCachedMembers = useCallback((companyId: string, data: UserProfile[]) => {
    try {
      const cache: TeamMembersCache = {
        companyId,
        members: data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`teamMembersCache_${companyId}`, JSON.stringify(cache));
    } catch (err) {
      console.error('Error caching team members:', err);
      // Continue without caching
    }
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedCompany) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      // Prevent duplicate requests
      if (isFetching) {
        return;
      }

      try {
        setIsLoading(true);
        setIsFetching(true);
        setError(null);

        // Try to get cached data first
        const cachedData = getCachedMembers();
        if (cachedData) {
          console.log('Using cached team members data');
          setMembers(cachedData.members);
          setIsLoading(false);
          
          // If we're using cached data, no need to fetch again right away
          // This helps prevent excessive requests
          return;
        }

        // First, query all user_empresa relations for the selected company
        const { data: userCompanyRelations, error: relationsError } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', selectedCompany?.id);

        if (relationsError) {
          throw relationsError;
        }

        if (!userCompanyRelations || userCompanyRelations.length === 0) {
          setMembers([]);
          setIsLoading(false);
          return;
        }

        // Extract user IDs from relations
        const userIds = userCompanyRelations.map(relation => relation.user_id);

        // Now fetch all profiles for these users in a single query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email, cargo, avatar, is_admin')
          .in('id', userIds);

        if (profilesError) {
          throw profilesError;
        }

        // Map profiles to UserProfile type
        const teamMembers: UserProfile[] = profilesData.map(profile => ({
          id: profile.id,
          display_name: profile.display_name,
          email: profile.email,
          cargo: profile.cargo,
          avatar: profile.avatar,
          is_admin: profile.is_admin
        }));

        setMembers(teamMembers);
        
        // Cache the fetched data
        if (selectedCompany?.id) {
          setCachedMembers(selectedCompany.id, teamMembers);
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
        toast.error("Erro ao carregar membros da equipe");
        setError(err as Error);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchMembers();
  }, [selectedCompany, getCachedMembers, setCachedMembers, isFetching]);

  return { members, isLoading, error };
};
