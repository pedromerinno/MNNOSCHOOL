
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Company } from '@/types/company';
import { toast } from "sonner";

interface UseCompanyDeleteProps {
  setIsLoading: (loading: boolean) => void;
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
  
  const deleteCompany = useCallback(async (companyId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', companyId);
  
      if (error) throw error;
  
      // Remove from companies list
      setCompanies(prevCompanies => prevCompanies.filter(company => company.id !== companyId));
      
      // Clear selected company if it's the one being deleted
      if (selectedCompany?.id === companyId) {
        setSelectedCompany(null);
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompanyId');
      }
      
      toast.success("Empresa excluída com sucesso!");
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error("Erro ao excluir empresa");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, selectedCompany, setSelectedCompany]);
  
  return { deleteCompany };
};
