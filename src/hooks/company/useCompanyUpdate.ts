
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";

interface UseCompanyUpdateProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setCompanies: Dispatch<SetStateAction<Company[]>>;
  selectedCompany: Company | null;
  setSelectedCompany: Dispatch<SetStateAction<Company | null>>;
}

export const useCompanyUpdate = ({
  setIsLoading,
  setCompanies,
  selectedCompany,
  setSelectedCompany
}: UseCompanyUpdateProps) => {
  /**
   * Updates an existing company
   */
  const updateCompany = async (companyId: string, companyData: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update(companyData)
        .eq('id', companyId)
        .select('*')
        .single();

      if (error) {
        console.error("Error updating company:", error);
        toast("Erro ao atualizar empresa", {
          description: error.message,
        });
        return null;
      }

      // Update the local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId ? { ...company, ...data } as Company : company
      ));
      
      // If the selected company was updated, update it as well
      if (selectedCompany && selectedCompany.id === companyId) {
        const updatedCompany = { ...selectedCompany, ...data } as Company;
        setSelectedCompany(updatedCompany);
        
        // Dispatch event to notify other components about the company update
        window.dispatchEvent(new CustomEvent('company-updated', { 
          detail: { company: updatedCompany } 
        }));
      }
      
      toast("Empresa atualizada", {
        description: "A empresa foi atualizada com sucesso",
      });
      
      return data as Company;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast("Erro inesperado", {
        description: "Ocorreu um erro ao atualizar a empresa",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateCompany
  };
};
