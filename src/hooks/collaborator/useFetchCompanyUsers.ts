
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { UserProfile } from "@/hooks/useUsers";

export const useFetchCompanyUsers = (
  setCompanyUsers: (users: UserProfile[]) => void,
  setIsLoading: (loading: boolean) => void,
  setUserRoles: (roles: Record<string, string>) => void,
  initialFetchDone: React.MutableRefObject<boolean>,
  setError: (error: string | null) => void
) => {
  const fetchCompanyUsers = useCallback(async (company: Company) => {
    if (!company?.id) {
      console.warn("No company ID provided");
      setCompanyUsers([]);
      setUserRoles({});
      return;
    }

    setIsLoading(true);
    setError(null);
    
    let lastError: any = null;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      console.log(`[useFetchCompanyUsers] Starting fetch for company: ${company.id}`);
      const startTime = Date.now();

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[useFetchCompanyUsers] Attempt ${attempt}/${maxRetries}`);

          // Query otimizada usando função helper que usa view pré-processada
          // Tudo vem em uma única query com dados já combinados
          const { data: usersData, error: usersError } = await supabase
            .rpc('get_company_users', { _empresa_id: company.id });

          if (usersError) {
            // Se for erro de rede, tentar novamente
            if ((usersError.message?.includes('Failed to fetch') || 
                 usersError.message?.includes('NetworkError') ||
                 usersError.message?.includes('fetch')) &&
                attempt < maxRetries) {
              lastError = usersError;
              console.log(`[useFetchCompanyUsers] Network error, retrying in ${retryDelay * attempt}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
              continue;
            }
            
            throw usersError;
          }

          if (!usersData || usersData.length === 0) {
            console.log("No users found for company");
            setCompanyUsers([]);
            setUserRoles({});
            initialFetchDone.current = true;
            return;
          }

          // Processar dados da view otimizada (já vem tudo combinado!)
          const users: UserProfile[] = [];
          const roles: Record<string, string> = {};

          usersData.forEach((user: any) => {
            users.push({
              id: user.id,
              display_name: user.display_name,
              email: user.email,
              is_admin: user.is_admin || false,
              super_admin: user.super_admin || false,
              avatar: user.avatar,
              created_at: user.created_at,
              cargo_id: user.cargo_id || null
            });

            // Cargo title já vem na view!
            if (user.cargo_title) {
              roles[user.id] = user.cargo_title;
            }
          });

          const endTime = Date.now();
          console.log(`[useFetchCompanyUsers] Completed in ${endTime - startTime}ms. Loaded ${users.length} profiles and ${Object.keys(roles).length} roles`);

          setCompanyUsers(users);
          setUserRoles(roles);
          initialFetchDone.current = true;
          return; // Sucesso, sair do loop

        } catch (error: any) {
          lastError = error;
          console.error(`[useFetchCompanyUsers] Error on attempt ${attempt}:`, error);
          
          if (error.name === 'AbortError') {
            console.log("[useFetchCompanyUsers] Request was aborted - this is normal if user navigated away");
            return; // Don't show error for aborted requests
          }

          // Se não for erro de rede ou já tentou todas as vezes, não tentar novamente
          if ((!error.message?.includes('Failed to fetch') && 
               !error.message?.includes('NetworkError') && 
               !error.message?.includes('fetch')) ||
              attempt >= maxRetries) {
            
            let errorMessage = "Erro ao carregar colaboradores";
            
            if (error.message?.includes('Failed to fetch') || 
                error.message?.includes('NetworkError') ||
                error.message?.includes('fetch')) {
              errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
            return;
          }

          if (attempt < maxRetries) {
            console.log(`[useFetchCompanyUsers] Retrying in ${retryDelay * attempt}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          }
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      if (lastError) {
        let errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        setError(errorMessage);
        toast.error(errorMessage);
      }

    } catch (error: any) {
      console.error("[useFetchCompanyUsers] Unexpected error:", error);
      
      if (error.name === 'AbortError') {
        console.log("[useFetchCompanyUsers] Request was aborted - this is normal if user navigated away");
        return; // Don't show error for aborted requests
      }
      
      let errorMessage = "Erro ao carregar colaboradores";
      
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('NetworkError') ||
          error.message?.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [setCompanyUsers, setIsLoading, setUserRoles, initialFetchDone, setError]);

  return { fetchCompanyUsers };
};
