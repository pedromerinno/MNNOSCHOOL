
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";

interface UseCompanyFetchProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setCompanies: Dispatch<SetStateAction<Company[]>>;
  setUserCompanies: Dispatch<SetStateAction<Company[]>>;
  setSelectedCompany: Dispatch<SetStateAction<Company | null>>;
}

// Helper function to retry failed fetch operations
const retryOperation = async (operation: () => Promise<any>, maxRetries = 2, delay = 800) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Fetch attempt ${attempt + 1} failed, retrying...`, error);
      lastError = error;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next retry (exponential backoff)
      delay *= 1.5;
    }
  }
  
  // If all retries fail, throw the last error
  throw lastError;
};

export const useCompanyFetch = ({
  setIsLoading,
  setCompanies,
  setUserCompanies,
  setSelectedCompany
}: UseCompanyFetchProps) => {

  /**
   * Fetches all companies from the database
   */
  const fetchCompanies = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await retryOperation(
        async () => await supabase.from('empresas').select('*').order('nome')
      );

      if (error) {
        console.error("Error fetching companies:", error);
        toast("Erro ao buscar empresas", {
          description: error.message,
        });
        return;
      }

      setCompanies(data as Company[]);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao buscar as empresas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches all companies a user is related to and automatically selects
   * the first one if there's only one company
   */
  const getUserCompanies = async (userId: string): Promise<Company[]> => {
    setIsLoading(true);
    try {
      // Verificar primeiro se já temos dados em cache
      const cachedCompanies = localStorage.getItem('userCompanies');
      let cachedData: Company[] = [];
      
      if (cachedCompanies) {
        try {
          cachedData = JSON.parse(cachedCompanies) as Company[];
          // Atualizar o estado com dados em cache imediatamente
          setUserCompanies(cachedData);
          console.log("Usando dados em cache enquanto busca atualização");
          
          // Se tivermos apenas uma empresa em cache, selecione-a automaticamente
          if (cachedData.length === 1) {
            setSelectedCompany(cachedData[0]);
          }
        } catch (e) {
          console.error("Erro ao parsear empresas em cache", e);
        }
      }

      // Get all company IDs the user is related to with retry logic
      const { data: userCompanyRelations, error: relationsError } = await retryOperation(
        async () => await supabase.from('user_empresa').select('company_id').eq('user_id', userId)
      );

      if (relationsError) {
        console.error("Error fetching user company relations:", relationsError);
        toast("Erro ao buscar empresas do usuário", {
          description: relationsError.message,
        });
        
        // Return cached data if available
        if (cachedData.length > 0) {
          setIsLoading(false);
          return cachedData;
        }
        return [];
      }

      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        console.log("No company relations found for user", userId);
        setUserCompanies([]);
        setSelectedCompany(null);
        localStorage.removeItem('userCompanies');
        setIsLoading(false);
        return [];
      }

      // Extract company IDs
      const companyIds = userCompanyRelations.map(relation => relation.company_id);

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
      
      // Cache the companies for offline fallback
      if (userCompaniesData.length > 0) {
        localStorage.setItem('userCompanies', JSON.stringify(userCompaniesData));
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
      const cachedCompanies = localStorage.getItem('userCompanies');
      if (cachedCompanies) {
        try {
          const parsed = JSON.parse(cachedCompanies) as Company[];
          console.log("Using cached companies due to error");
          return parsed;
        } catch (e) {
          console.error("Error parsing cached companies", e);
        }
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gets a specific company by ID
   */
  const getCompanyById = async (companyId: string): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await retryOperation(
        async () => await supabase.from('empresas').select('*').eq('id', companyId).single()
      );

      if (error) {
        console.error("Error fetching company:", error);
        toast("Erro ao buscar empresa", {
          description: error.message,
        });
        return null;
      }

      return data as Company;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao buscar a empresa",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchCompanies,
    getUserCompanies,
    getCompanyById
  };
};
