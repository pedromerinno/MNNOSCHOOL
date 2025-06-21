
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from 'sonner';

export interface CompanyUser {
  id: string;
  display_name: string;
  email: string;
  cargo_id?: string;
  job_role?: {
    title: string;
  };
}

export const useCompanyUsers = () => {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCompany } = useCompanies();

  const fetchCompanyUsers = async () => {
    if (!selectedCompany?.id) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_empresa')
        .select(`
          user_id,
          profiles!inner (
            id,
            display_name,
            email,
            cargo_id,
            job_roles (
              title
            )
          )
        `)
        .eq('empresa_id', selectedCompany.id);

      if (error) {
        console.error('Error fetching company users:', error);
        toast.error('Erro ao carregar usuários da empresa');
        return;
      }

      const companyUsers = (data || []).map((item: any) => ({
        id: item.profiles.id,
        display_name: item.profiles.display_name || 'Usuário sem nome',
        email: item.profiles.email || '',
        cargo_id: item.profiles.cargo_id,
        job_role: item.profiles.job_roles
      }));

      setUsers(companyUsers);
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast.error('Erro ao carregar usuários da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyUsers();
  }, [selectedCompany?.id]);

  return {
    users,
    isLoading,
    refetch: fetchCompanyUsers
  };
};
