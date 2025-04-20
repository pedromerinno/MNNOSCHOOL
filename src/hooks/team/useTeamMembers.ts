
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { UserProfile } from "@/hooks/useUsers";
import { toast } from "sonner";

const CACHE_KEY = 'team_members_cache';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

export const useTeamMembers = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { selectedCompany } = useCompanies();

  const getCachedMembers = () => {
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
  };

  const cacheMembers = (data: UserProfile[]) => {
    try {
      // Only cache essential data, limiting the size
      const minimalData = data.map(member => ({
        id: member.id,
        display_name: member.display_name,
        email: member.email,
        is_admin: member.is_admin,
        cargo_id: member.cargo_id,
        avatar: member.avatar
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
  };

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedCompany) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      try {
        setError(null);

        const cachedData = getCachedMembers();
        if (cachedData) {
          setMembers(cachedData);
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }

        // Load data in batches to avoid memory issues
        const { data: userCompanyRelations, error: relationsError } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', selectedCompany.id);

        if (relationsError) throw relationsError;

        if (!userCompanyRelations || userCompanyRelations.length === 0) {
          setMembers([]);
          setIsLoading(false);
          return;
        }

        const userIds = userCompanyRelations.map(relation => relation.user_id);

        // Fetch profiles in smaller batches if there are many users
        const batchSize = 20;
        let allProfiles: UserProfile[] = [];

        for (let i = 0; i < userIds.length; i += batchSize) {
          const batchIds = userIds.slice(i, i + batchSize);
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, display_name, email, cargo_id, avatar, is_admin')
            .in('id', batchIds);

          if (profilesError) throw profilesError;
          
          if (profilesData && profilesData.length > 0) {
            allProfiles = [...allProfiles, ...profilesData];
          }
        }

        const teamMembers: UserProfile[] = allProfiles.map(profile => ({
          id: profile.id,
          display_name: profile.display_name,
          email: profile.email,
          cargo_id: profile.cargo_id,
          avatar: profile.avatar,
          is_admin: profile.is_admin
        }));

        setMembers(teamMembers);
        
        // Try to cache, but don't fail if it doesn't work
        try {
          cacheMembers(teamMembers);
        } catch (cacheError) {
          console.warn('Could not cache team members:', cacheError);
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError(err as Error);
        toast.error("Erro ao carregar membros da equipe");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [selectedCompany]);

  return { members, isLoading, error };
};
