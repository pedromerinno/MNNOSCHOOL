
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

        const { data, error } = await supabase
          .from('user_empresa')
          .select(`
            user_id,
            profiles:user_id(id, display_name, email, cargo, avatar, is_admin)
          `)
          .eq('empresa_id', selectedCompany.id);

        if (error) {
          throw error;
        }

        // Transformar os dados para combinar com a estrutura UserProfile
        const teamMembers: UserProfile[] = data
          .map(item => item.profiles)
          .filter(Boolean);

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
