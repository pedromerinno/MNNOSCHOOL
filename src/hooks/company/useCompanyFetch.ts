
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
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');

      if (error) {
        console.error("Error fetching companies:", error);
        toast.error("Erro ao buscar empresas", {
          description: error.message,
        });
        return;
      }

      setCompanies(data as Company[]);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado", {
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
    try {
      setIsLoading(true);
      console.log('WelcomeSection: Fetching user companies for user:', userId);
      
      if (!userId) {
        console.warn("No user ID provided for getUserCompanies");
        setUserCompanies([]);
        setSelectedCompany(null);
        setIsLoading(false);
        return [];
      }

      // Maximum retries for network issues
      const maxRetries = 3;
      let retryCount = 0;
      let userCompanyRelations = null;
      let relationsError = null;

      // Try to fetch user-company relations with retries
      while (retryCount < maxRetries) {
        try {
          const response = await supabase
            .from('user_empresa')
            .select('company_id')
            .eq('user_id', userId);
          
          userCompanyRelations = response.data;
          relationsError = response.error;
          
          if (!relationsError) break;
          
          retryCount++;
          // Simple exponential backoff
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        } catch (e) {
          console.error(`Retry ${retryCount + 1}/${maxRetries} failed:`, e);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        }
      }

      if (relationsError || !userCompanyRelations) {
        console.error("Error fetching user company relations:", relationsError || "No data returned");
        toast.error("Erro ao buscar relações de empresa", {
          description: "Verifique sua conexão de internet e tente novamente",
        });
        setUserCompanies([]);
        setSelectedCompany(null);
        setIsLoading(false);
        return [];
      }

      if (userCompanyRelations.length === 0) {
        setUserCompanies([]);
        setSelectedCompany(null);
        setIsLoading(false);
        return [];
      }

      // Extract company IDs
      const companyIds = userCompanyRelations.map(relation => relation.company_id);

      // Fetch companies with retries
      retryCount = 0;
      let companies = null;
      let companiesError = null;

      while (retryCount < maxRetries) {
        try {
          const response = await supabase
            .from('empresas')
            .select('*')
            .in('id', companyIds)
            .order('nome');
          
          companies = response.data;
          companiesError = response.error;
          
          if (!companiesError) break;
          
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        } catch (e) {
          console.error(`Companies fetch retry ${retryCount + 1}/${maxRetries} failed:`, e);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        }
      }

      if (companiesError || !companies) {
        console.error("Error fetching companies:", companiesError || "No data returned");
        toast.error("Erro ao buscar detalhes das empresas", {
          description: "Verifique sua conexão de internet e tente novamente",
        });
        setUserCompanies([]);
        setSelectedCompany(null);
        setIsLoading(false);
        return [];
      }

      const userCompaniesData = companies as Company[];
      console.log('WelcomeSection: Companies fetched:', userCompaniesData.length);
      setUserCompanies(userCompaniesData);
      
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
      console.error("Unexpected error in getUserCompanies:", error);
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao buscar as empresas do usuário",
      });
      setUserCompanies([]);
      setSelectedCompany(null);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gets a specific company by ID
   */
  const getCompanyById = async (companyId: string): Promise<Company | null> => {
    try {
      setIsLoading(true);
      
      if (!companyId) {
        console.error("Invalid company ID provided");
        return null;
      }

      // Try to fetch with retries
      const maxRetries = 3;
      let retryCount = 0;
      let companyData = null;
      let fetchError = null;

      while (retryCount < maxRetries) {
        try {
          const response = await supabase
            .from('empresas')
            .select('*')
            .eq('id', companyId)
            .single();
          
          companyData = response.data;
          fetchError = response.error;
          
          if (!fetchError) break;
          
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        } catch (e) {
          console.error(`Company fetch retry ${retryCount + 1}/${maxRetries} failed:`, e);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        }
      }

      if (fetchError) {
        console.error("Error fetching company:", fetchError);
        return null;
      }

      return companyData as Company;
    } catch (error) {
      console.error("Unexpected error in getCompanyById:", error);
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
