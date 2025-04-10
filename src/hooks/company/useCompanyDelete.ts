
import { useCallback } from "react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseCompanyDeleteProps {
  setIsLoading: (isLoading: boolean) => void;
  setCompanies: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanyDelete = ({ 
  setIsLoading, 
  setCompanies,
  selectedCompany,
  setSelectedCompany
}: UseCompanyDeleteProps) => {
  /**
   * Delete a company
   */
  const deleteCompany = useCallback(async (companyId: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', companyId);
        
      if (error) {
        console.error('Error deleting company:', error);
        toast.error("Erro ao excluir empresa");
        return false;
      }
      
      toast.success("Empresa excluída com sucesso");
      
      // Update the list of companies
      setCompanies((prevCompanies: Company[]) => 
        prevCompanies.filter(company => company.id !== companyId)
      );
      
      // If this was the currently selected company, clear it
      if (selectedCompany && selectedCompany.id === companyId) {
        setSelectedCompany(null);
        localStorage.removeItem('selectedCompanyId');
        localStorage.removeItem('selectedCompany');
      }
      
      // Remove from local storage cache
      const cachedCompanies = localStorage.getItem('userCompanies');
      if (cachedCompanies) {
        try {
          const companies = JSON.parse(cachedCompanies) as Company[];
          const updatedCache = companies.filter(c => c.id !== companyId);
          localStorage.setItem('userCompanies', JSON.stringify(updatedCache));
        } catch (e) {
          console.error('Error updating company cache:', e);
        }
      }
      
      // Trigger refresh event
      window.dispatchEvent(new Event('company-relation-changed'));
      
      return true;
    } catch (error) {
      console.error('Unexpected error deleting company:', error);
      toast.error("Erro inesperado ao excluir empresa");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, selectedCompany, setSelectedCompany]);
  
  return { deleteCompany };
};
