
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
    setIsLoading(true);
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        // Get all company IDs the user is related to
        const { data: userCompanyRelations, error: relationsError } = await supabase
          .from('user_empresa')
          .select('company_id')
          .eq('user_id', userId);

        if (relationsError) {
          console.error("Error fetching user company relations:", relationsError);
          retries++;
          
          if (retries === maxRetries) {
            toast.error("Erro ao buscar empresas", {
              description: relationsError.message,
            });
            setIsLoading(false);
            return [];
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }

        if (!userCompanyRelations || userCompanyRelations.length === 0) {
          setUserCompanies([]);
          setSelectedCompany(null);
          setIsLoading(false);
          return [];
        }

        // Extract company IDs
        const companyIds = userCompanyRelations.map(relation => relation.company_id);

        // Fetch all companies with these IDs
        const { data: companies, error: companiesError } = await supabase
          .from('empresas')
          .select('*')
          .in('id', companyIds)
          .order('nome');

        if (companiesError) {
          console.error("Error fetching companies:", companiesError);
          retries++;
          
          if (retries === maxRetries) {
            toast.error("Erro ao buscar detalhes das empresas", {
              description: companiesError.message,
            });
            setIsLoading(false);
            return [];
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }

        const userCompaniesData = companies as Company[];
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
        
        setIsLoading(false);
        return userCompaniesData;
      } catch (error) {
        console.error("Unexpected error:", error);
        retries++;
        
        if (retries === maxRetries) {
          toast.error("Erro ao buscar empresas", {
            description: "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
          });
          setIsLoading(false);
          return [];
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    setIsLoading(false);
    return [];
  };

  /**
   * Gets a specific company by ID
   */
  const getCompanyById = async (companyId: string): Promise<Company | null> => {
    setIsLoading(true);
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', companyId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching company:", error);
          retries++;
          
          if (retries === maxRetries) {
            toast.error("Erro ao buscar empresa", {
              description: error.message,
            });
            setIsLoading(false);
            return null;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }

        setIsLoading(false);
        return data as Company;
      } catch (error) {
        console.error("Unexpected error:", error);
        retries++;
        
        if (retries === maxRetries) {
          toast.error("Erro ao buscar empresa", {
            description: "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
          });
          setIsLoading(false);
          return null;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    setIsLoading(false);
    return null;
  };

  return {
    fetchCompanies,
    getUserCompanies,
    getCompanyById
  };
};
