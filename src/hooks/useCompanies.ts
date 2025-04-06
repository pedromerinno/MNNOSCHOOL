
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "@/components/ui/use-toast";

export const useCompanies = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

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
        toast({
          title: "Erro ao buscar empresas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setCompanies(data as Company[]);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao buscar as empresas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches all companies a user is related to
   * Only reads data, doesn't modify relationships
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
        toast({
          title: "Erro ao buscar empresa",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      return data as Company;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao buscar a empresa",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Only expose the read-only functions
  return {
    isLoading,
    companies,
    fetchCompanies,
    getUserCompanies,
    getCompanyById
  };
};
