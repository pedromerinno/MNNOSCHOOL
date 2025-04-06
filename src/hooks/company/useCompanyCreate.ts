
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";

interface UseCompanyCreateProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setCompanies: Dispatch<SetStateAction<Company[]>>;
}

export const useCompanyCreate = ({
  setIsLoading,
  setCompanies
}: UseCompanyCreateProps) => {
  /**
   * Creates a new company in the database
   */
  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert([companyData])
        .select('*')
        .single();

      if (error) {
        console.error("Error creating company:", error);
        toast("Erro ao criar empresa", {
          description: error.message,
        });
        return null;
      }

      // Update the local state
      setCompanies(prev => [...prev, data as Company]);
      
      toast("Empresa criada", {
        description: "A empresa foi criada com sucesso",
      });
      
      return data as Company;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao criar a empresa",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCompany
  };
};
