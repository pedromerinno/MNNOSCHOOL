
import { useCallback } from "react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseCompanyUpdateProps {
  setIsLoading: (isLoading: boolean) => void;
  setCompanies: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanyUpdate = ({ 
  setIsLoading, 
  setCompanies,
  selectedCompany,
  setSelectedCompany
}: UseCompanyUpdateProps) => {
  /**
   * Update an existing company
   */
  const updateCompany = useCallback(async (
    companyId: string,
    formData: Partial<Company>
  ) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update(formData)
        .eq('id', companyId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating company:', error);
        toast.error("Erro ao atualizar empresa");
        return null;
      }
      
      const updatedCompany = data as Company;
      
      toast.success(`Empresa ${updatedCompany.nome} atualizada com sucesso`);
      
      // Update the list of companies
      setCompanies((prevCompanies: Company[]) => 
        prevCompanies.map(company => 
          company.id === companyId ? updatedCompany : company
        )
      );
      
      // If this is the currently selected company, update it
      if (selectedCompany && selectedCompany.id === companyId) {
        setSelectedCompany(updatedCompany);
        
        // Update in localStorage
        localStorage.setItem('selectedCompany', JSON.stringify(updatedCompany));
        
        // Trigger company-updated event
        window.dispatchEvent(new CustomEvent('company-updated', { 
          detail: { company: updatedCompany } 
        }));
      }
      
      // Trigger refresh event
      window.dispatchEvent(new Event('company-relation-changed'));
      
      return updatedCompany;
    } catch (error) {
      console.error('Unexpected error updating company:', error);
      toast.error("Erro inesperado ao atualizar empresa");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, selectedCompany, setSelectedCompany]);
  
  return { updateCompany };
};
