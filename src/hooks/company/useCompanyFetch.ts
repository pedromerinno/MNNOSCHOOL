
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
      console.log(`Fetching companies for user ${userId}`);
      
      // Get all company IDs the user is related to
      const { data: userCompanyRelations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('company_id')
        .eq('user_id', userId);

      if (relationsError) {
        console.error("Error fetching user company relations:", relationsError);
        
        // Add mock company data for development/testing when database is unavailable
        if (process.env.NODE_ENV === 'development' || relationsError.message.includes('Failed to fetch')) {
          console.log('Using mock company data for development');
          const mockCompanies = [{
            id: 'mock-1',
            nome: 'Mock Company',
            logo: null,
            frase_institucional: 'Esta é uma empresa de exemplo para desenvolvimento',
            missao: 'Nossa missão é facilitar o desenvolvimento',
            historia: 'Fundada para desenvolvimento',
            valores: 'Desenvolvimento, Inovação',
            video_institucional: null,
            descricao_video: null,
            cor_principal: '#3B82F6',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];
          
          setUserCompanies(mockCompanies);
          setSelectedCompany(mockCompanies[0]);
          
          return mockCompanies;
        }
        
        toast("Erro ao buscar empresas", {
          description: relationsError.message,
        });
        return [];
      }

      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        setUserCompanies([]);
        setSelectedCompany(null);
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
        toast("Erro ao buscar detalhes das empresas", {
          description: companiesError.message,
        });
        return [];
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
      } else if (userCompaniesData.length > 0) {
        // If there are multiple companies but none selected, select the first one
        const storedCompanyId = localStorage.getItem('selectedCompanyId');
        
        if (!storedCompanyId) {
          setSelectedCompany(userCompaniesData[0]);
          // Save to localStorage for persistence
          localStorage.setItem('selectedCompanyId', userCompaniesData[0].id);
          
          // Dispatch event to notify other components
          const navEvent = new CustomEvent('company-selected', { 
            detail: { userId, company: userCompaniesData[0] } 
          });
          window.dispatchEvent(navEvent);
        }
      }
      
      return userCompaniesData;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao buscar as empresas",
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
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', companyId)
        .single();

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
