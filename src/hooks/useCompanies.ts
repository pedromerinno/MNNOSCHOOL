
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company, UserCompanyDetails } from "@/types/company";
import { toast } from "@/components/ui/use-toast";

export const useCompanies = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetches a user's company from the database
   */
  const getUserCompany = async (userId: string): Promise<UserCompanyDetails> => {
    setIsLoading(true);
    try {
      // First get the user's company relation
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('user_empresa')
        .select('company_id')
        .eq('user_id', userId)
        .single();

      if (userCompanyError) {
        console.error("Error fetching user company relation:", userCompanyError);
        return { company: null, loading: false, error: userCompanyError };
      }

      if (!userCompanyData) {
        return { company: null, loading: false, error: null };
      }

      // Then fetch the company details
      const { data: companyData, error: companyError } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', userCompanyData.company_id)
        .single();

      if (companyError) {
        console.error("Error fetching company:", companyError);
        return { company: null, loading: false, error: companyError };
      }

      return { company: companyData as Company, loading: false, error: null };
    } catch (error) {
      console.error("Unexpected error:", error);
      return { company: null, loading: false, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches all companies a user is related to
   */
  const getUserCompanies = async (userId: string): Promise<Company[]> => {
    setIsLoading(true);
    try {
      // Get all company IDs the user is related to
      const { data: userCompanyRelations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('company_id')
        .eq('user_id', userId);

      if (relationsError) {
        console.error("Error fetching user company relations:", relationsError);
        toast({
          title: "Erro ao buscar empresas",
          description: relationsError.message,
          variant: "destructive",
        });
        return [];
      }

      if (!userCompanyRelations || userCompanyRelations.length === 0) {
        return [];
      }

      // Extract company IDs
      const companyIds = userCompanyRelations.map(relation => relation.company_id);

      // Fetch all companies with these IDs
      const { data: companies, error: companiesError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', companyIds);

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        toast({
          title: "Erro ao buscar detalhes das empresas",
          description: companiesError.message,
          variant: "destructive",
        });
        return [];
      }

      return companies as Company[];
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao buscar as empresas",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getUserCompany,
    getUserCompanies,
  };
};
