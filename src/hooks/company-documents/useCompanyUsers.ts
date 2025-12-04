
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
    let lastError: any = null;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[useCompanyUsers] Attempt ${attempt}/${maxRetries} to fetch company users`);
          
          // Query otimizada usando função helper que usa view pré-processada
          // Tudo vem em uma única query com dados já combinados
          const { data: usersData, error: usersError } = await supabase
            .rpc('get_company_users', { _empresa_id: selectedCompany.id });

          if (usersError) {
            console.error('Error fetching company users:', usersError);
            
            // Se for erro de rede, tentar novamente
            if (usersError.message?.includes('Failed to fetch') || 
                usersError.message?.includes('NetworkError') ||
                usersError.message?.includes('fetch')) {
              lastError = usersError;
              
              if (attempt < maxRetries) {
                console.log(`[useCompanyUsers] Retrying in ${retryDelay * attempt}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
                continue;
              }
            }
            
            // Detectar tipo de erro e mostrar mensagem apropriada
            let errorMessage = 'Erro ao carregar usuários da empresa';
            
            if (usersError.message?.includes('Failed to fetch') || 
                usersError.message?.includes('NetworkError') ||
                usersError.message?.includes('fetch')) {
              errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } else if (usersError.message) {
              errorMessage = `Erro ao carregar usuários: ${usersError.message}`;
            }
            
            toast.error(errorMessage);
            return;
          }

          if (!usersData || usersData.length === 0) {
            setUsers([]);
            return;
          }

          // Processar dados da view otimizada (já vem tudo combinado!)
          const companyUsers: CompanyUser[] = usersData.map((user: any) => ({
            id: user.id,
            display_name: user.display_name || 'Usuário sem nome',
            email: user.email || '',
            cargo_id: user.cargo_id || undefined,
            job_role: user.cargo_title ? { title: user.cargo_title } : undefined
          }));

          setUsers(companyUsers);
          return; // Sucesso, sair do loop
        } catch (error: any) {
          lastError = error;
          console.error(`[useCompanyUsers] Error on attempt ${attempt}:`, error);
          
          // Se não for erro de rede ou já tentou todas as vezes, não tentar novamente
          if ((!error.message?.includes('Failed to fetch') && 
               !error.message?.includes('NetworkError') && 
               !error.message?.includes('fetch')) ||
              attempt >= maxRetries) {
            
            let errorMessage = 'Erro ao carregar usuários da empresa';
            
            if (error.message?.includes('Failed to fetch') || 
                error.message?.includes('NetworkError') ||
                error.message?.includes('fetch')) {
              errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } else if (error.message) {
              errorMessage = `Erro ao carregar usuários: ${error.message}`;
            }
            
            toast.error(errorMessage);
            return;
          }
          
          if (attempt < maxRetries) {
            console.log(`[useCompanyUsers] Retrying in ${retryDelay * attempt}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          }
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      if (lastError) {
        let errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        toast.error(errorMessage);
      }
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
