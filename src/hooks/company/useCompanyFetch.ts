
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

      if (data && data.length > 0) {
        setCompanies(data as Company[]);
      } else {
        console.log("No companies found");
      }
    } catch (error) {
      console.error("Unexpected error fetching companies:", error);
      toast.error("Erro inesperado ao buscar empresas", {
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
      console.log("Fetching companies for user:", userId);
      
      // Get all company IDs the user is related to
      const { data: userCompanyRelations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('company_id')
        .eq('user_id', userId);

      if (relationsError) {
        console.error("Error fetching user company relations:", relationsError);
        toast.error("Erro ao buscar empresas", {
          description: relationsError.message,
        });
        return [];
      }

      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        console.log("User has no company relations");
        setUserCompanies([]);
        setSelectedCompany(null);
        return [];
      }

      console.log("User company relations found:", userCompanyRelations.length);
      
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
        toast.error("Erro ao buscar detalhes das empresas", {
          description: companiesError.message,
        });
        return [];
      }

      const userCompaniesData = companies as Company[];
      console.log("Retrieved user companies:", userCompaniesData.length);
      
      if (userCompaniesData.length > 0) {
        console.log("Sample company data:", {
          id: userCompaniesData[0].id,
          name: userCompaniesData[0].nome,
          phrase: userCompaniesData[0].frase_institucional
        });
        
        setUserCompanies(userCompaniesData);
        
        // If there's only one company, automatically select it
        if (userCompaniesData.length === 1) {
          setSelectedCompany(userCompaniesData[0]);
          
          // Dispatch event to notify other components about this selection
          const navEvent = new CustomEvent('company-selected', { 
            detail: { userId, company: userCompaniesData[0] } 
          });
          window.dispatchEvent(navEvent);
          
          localStorage.setItem('selectedCompanyId', userCompaniesData[0].id);
        }
      } else {
        console.log("No companies found with the related IDs");
      }
      
      return userCompaniesData;
    } catch (error) {
      console.error("Unexpected error fetching user companies:", error);
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao buscar as empresas do usuário",
      });
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
      console.log("Fetching company with ID:", companyId);
      
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error("Error fetching company:", error);
        toast.error("Erro ao buscar empresa", {
          description: error.message,
        });
        return null;
      }

      if (!data) {
        console.log("No company found with ID:", companyId);
        return null;
      }
      
      console.log("Company found:", data.nome);
      return data as Company;
    } catch (error) {
      console.error("Unexpected error fetching company:", error);
      toast.error("Erro inesperado", {
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
