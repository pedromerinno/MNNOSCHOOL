
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { UserProfile } from "@/hooks/useUsers";
import { toast } from "sonner";

export const useTeamMembers = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { selectedCompany } = useCompanies();

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedCompany) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // First, query all user_empresa relations for the selected company
        const { data: userCompanyRelations, error: relationsError } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', selectedCompany.id);

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

        // Now fetch all profiles for these users
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
