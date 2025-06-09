
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Company } from '@/types/company';
import { toast } from "sonner";
import { useCompanySync } from './useCompanySync';

interface UseCompanyUpdateProps {
  setIsLoading: (loading: boolean) => void;
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
  
  const { syncCompanyData } = useCompanySync();
  
  const updateCompany = useCallback(async (companyId: string, data: Partial<Company>) => {
    setIsLoading(true);
    try {
      const { data: updatedCompany, error } = await supabase
        .from('empresas')
        .update(data)
        .eq('id', companyId)
        .select()
        .single();
  
      if (error) throw error;
  
      if (updatedCompany) {
        // Update companies list
        setCompanies(prevCompanies => prevCompanies.map(company => 
          company.id === companyId ? { ...company, ...updatedCompany } : company
        ));
        
        // Update selected company if it's the one being updated
        if (selectedCompany?.id === companyId) {
          const newSelectedCompany = { ...selectedCompany, ...updatedCompany };
          setSelectedCompany(newSelectedCompany);
          
          // Usar o novo sistema de sincronização
          syncCompanyData(newSelectedCompany);
        }
        
        toast.success(`Empresa ${updatedCompany.nome} atualizada com sucesso!`);
      }
      
      return updatedCompany as Company;
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error("Erro ao atualizar empresa");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, selectedCompany, setSelectedCompany, syncCompanyData]);
  
  return { updateCompany };
};
