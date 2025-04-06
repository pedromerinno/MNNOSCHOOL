
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";

interface UseCompanyDeleteProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setCompanies: Dispatch<SetStateAction<Company[]>>;
  selectedCompany: Company | null;
  setSelectedCompany: Dispatch<SetStateAction<Company | null>>;
}

export const useCompanyDelete = ({
  setIsLoading,
  setCompanies,
  selectedCompany,
  setSelectedCompany
}: UseCompanyDeleteProps) => {
  /**
   * Deletes a company by ID
   */
  const deleteCompany = async (companyId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', companyId);

      if (error) {
        console.error("Error deleting company:", error);
        toast("Erro ao excluir empresa", {
          description: error.message,
        });
        return false;
      }

      // Update the local state
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      
      // If the selected company was deleted, clear it
      if (selectedCompany && selectedCompany.id === companyId) {
        setSelectedCompany(null);
      }
      
      toast("Empresa excluída", {
        description: "A empresa foi excluída com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao excluir a empresa",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteCompany
  };
};
