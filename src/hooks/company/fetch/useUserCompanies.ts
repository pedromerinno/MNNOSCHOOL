
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { UseCompanyFetchProps } from "../types/fetchTypes";
import { toast } from "sonner";

// Cache expiration time in ms (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

export const useUserCompanies = ({
  setIsLoading,
  setUserCompanies,
  setSelectedCompany,
  setError,
  incrementFetchCount
}: UseCompanyFetchProps) => {
  
  const isCacheValid = (): boolean => {
    const cachedData = localStorage.getItem('userCompaniesTimestamp');
    if (!cachedData) return false;
    
    try {
      const timestamp = parseInt(cachedData, 10);
      const now = Date.now();
      return (now - timestamp) < CACHE_EXPIRATION;
    } catch (e) {
      return false;
    }
  };

  const getUserCompanies = async (userId: string, signal?: AbortSignal): Promise<Company[]> => {
    try {
      setIsLoading(true);
      if (incrementFetchCount) {
        incrementFetchCount();
      }

      // Primeiro, verifica se há cache válido
      if (isCacheValid()) {
        const cachedData = localStorage.getItem('userCompanies');
        if (cachedData) {
          try {
            const companies = JSON.parse(cachedData) as Company[];
            if (companies && companies.length > 0) {
              console.log("Utilizando empresas em cache", companies.length);
              setUserCompanies(companies);
              
              // Se existir apenas uma empresa, automaticamente seleciona-a
              if (companies.length === 1) {
                setSelectedCompany(companies[0]);
              }
              
              return companies;
            }
          } catch (e) {
            console.error("Erro ao analisar empresas em cache", e);
          }
        }
      }

      console.log("Buscando empresas para o usuário:", userId);

      // Usar a nova função RPC que criamos
      const { data: companies, error: companiesError } = await supabase
        .rpc('get_user_companies', { user_id: userId });

      if (companiesError) {
        console.error("Erro ao buscar empresas via RPC:", companiesError);
        throw companiesError;
      }

      if (companies && Array.isArray(companies)) {
        console.log(`Encontradas ${companies.length} empresas para o usuário via RPC`);
        setUserCompanies(companies);
        
        // Cache os resultados
        localStorage.setItem('userCompanies', JSON.stringify(companies));
        localStorage.setItem('userCompaniesTimestamp', Date.now().toString());

        // Se apenas uma empresa, automaticamente seleciona
        if (companies.length === 1) {
          setSelectedCompany(companies[0]);
        }
        
        return companies;
      }

      return [];
    } catch (error: any) {
      console.error("Erro em getUserCompanies:", error);
      
      // Notifica o usuário sobre o erro
      toast.error("Erro ao carregar empresas", {
        description: "Tentando novamente em alguns segundos..."
      });
      
      setError(error instanceof Error ? error : new Error("Falha ao buscar empresas"));
      
      // Tenta usar cache como último recurso
      const cachedData = localStorage.getItem('userCompanies');
      if (cachedData) {
        try {
          const cachedCompanies = JSON.parse(cachedData) as Company[];
          if (cachedCompanies && cachedCompanies.length > 0) {
            console.log("Usando empresas em cache após erro");
            setUserCompanies(cachedCompanies);
            return cachedCompanies;
          }
        } catch (e) {
          console.error("Erro ao analisar empresas em cache", e);
        }
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { getUserCompanies };
};
