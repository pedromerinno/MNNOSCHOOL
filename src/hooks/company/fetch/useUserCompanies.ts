
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { retryOperation } from "../utils/retryUtils";
import { UseCompanyFetchProps } from "../types/fetchTypes";

// Tempo de expiração do cache em ms (30 minutos)
const CACHE_EXPIRATION = 30 * 60 * 1000;

export const useUserCompanies = ({
  setIsLoading,
  setUserCompanies,
  setSelectedCompany
}: Pick<UseCompanyFetchProps, 'setIsLoading' | 'setUserCompanies' | 'setSelectedCompany'>) => {
  
  /**
   * Verifica se o cache de empresas está válido
   */
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
  
  /**
   * Atualiza o timestamp do cache de empresas
   */
  const updateCacheTimestamp = (): void => {
    localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
  };

  /**
   * Fetches all companies a user is related to and automatically selects
   * the first one if there's only one company
   */
  const getUserCompanies = async (userId: string): Promise<Company[]> => {
    // Primeiro, verifique se já temos dados em cache
    const cachedCompanies = localStorage.getItem('userCompanies');
    let cachedData: Company[] = [];
    
    // Usar dados em cache imediatamente para melhorar a percepção de velocidade
    if (cachedCompanies) {
      try {
        cachedData = JSON.parse(cachedCompanies) as Company[];
        
        // Atualizar o estado com dados em cache imediatamente
        setUserCompanies(cachedData);
        console.log("Usando dados em cache enquanto busca atualização");
        
        // Se tivermos apenas uma empresa em cache, selecione-a automaticamente
        if (cachedData.length === 1) {
          setSelectedCompany(cachedData[0]);
          
          // Pre-carregar a frase institucional para exibição imediata
          if (cachedData[0].frase_institucional) {
            // Dispatch event to notify other components about this selection
            const navEvent = new CustomEvent('company-selected', { 
              detail: { userId, company: cachedData[0] } 
            });
            window.dispatchEvent(navEvent);
          }
        }
        
        // Se o cache for válido e não estiver vazio, podemos retornar os dados do cache
        if (isCacheValid() && cachedData.length > 0) {
          console.log("Cache válido, pulando requisição ao servidor");
          return cachedData;
        }
      } catch (e) {
        console.error("Erro ao parsear empresas em cache", e);
      }
    }

    // Set loading indicator only if we don't have cached data
    if (cachedData.length === 0) {
      setIsLoading(true);
    }

    try {
      // Buscar ids das empresas e empresas em paralelo para reduzir tempo de carregamento
      const fetchRelationsPromise = retryOperation(
        async () => await supabase.from('user_empresa').select('empresa_id').eq('user_id', userId)
      );

      // Se já tivermos dados em cache, não bloqueamos a UI enquanto buscamos atualizações
      const userCompanyRelations = await fetchRelationsPromise;

      if (userCompanyRelations.error) {
        console.error("Error fetching user company relations:", userCompanyRelations.error);
        toast("Erro ao buscar empresas do usuário", {
          description: userCompanyRelations.error.message,
        });
        
        // Return cached data if available
        if (cachedData.length > 0) {
          setIsLoading(false);
          return cachedData;
        }
        return [];
      }

      if (!userCompanyRelations.data || userCompanyRelations.data.length === 0) {
        console.log("No company relations found for user", userId);
        setUserCompanies([]);
        setSelectedCompany(null);
        localStorage.removeItem('userCompanies');
        localStorage.removeItem('userCompaniesTimestamp');
        setIsLoading(false);
        return [];
      }

      // Extract company IDs
      const companyIds = userCompanyRelations.data.map(relation => relation.empresa_id);

      // Fetch all companies with these IDs
      const { data: companies, error: companiesError } = await retryOperation(
        async () => await supabase.from('empresas').select('*').in('id', companyIds).order('nome')
      );

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        toast("Erro ao buscar detalhes das empresas", {
          description: companiesError.message,
        });
        
        // Return cached data if available
        if (cachedData.length > 0) {
          setIsLoading(false);
          return cachedData;
        }
        return [];
      }

      const userCompaniesData = companies as Company[];
      setUserCompanies(userCompaniesData);
      
      // Cache the companies for offline fallback and update timestamp
      if (userCompaniesData.length > 0) {
        localStorage.setItem('userCompanies', JSON.stringify(userCompaniesData));
        updateCacheTimestamp();
      }
      
      // If there's only one company, automatically select it
      if (userCompaniesData.length === 1) {
        setSelectedCompany(userCompaniesData[0]);
        
        // Dispatch event to notify other components about this selection
        const navEvent = new CustomEvent('company-selected', { 
          detail: { userId, company: userCompaniesData[0] } 
        });
        window.dispatchEvent(navEvent);
      }
      
      return userCompaniesData;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao buscar as empresas",
      });
      
      // Return cached data in case of error
      if (cachedData.length > 0) {
        console.log("Using cached companies due to error");
        return cachedData;
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { getUserCompanies };
};
