
import { useCallback } from "react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseCompanyCreateProps {
  setIsLoading: (isLoading: boolean) => void;
  setCompanies: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
}

export const useCompanyCreate = ({ 
  setIsLoading, 
  setCompanies 
}: UseCompanyCreateProps) => {
  /**
   * Create a new company
   */
  const createCompany = useCallback(async (
    formData: Omit<Company, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert(formData)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating company:', error);
        toast.error("Erro ao criar empresa");
        return null;
      }
      
      const newCompany = data as Company;
      
      toast.success(`Empresa ${newCompany.nome} criada com sucesso`);
      
      // Update the list of companies
      setCompanies((prevCompanies: Company[]) => [...prevCompanies, newCompany]);
      
      // Trigger refresh event
      window.dispatchEvent(new Event('company-relation-changed'));
      
      return newCompany;
    } catch (error) {
      console.error('Unexpected error creating company:', error);
      toast.error("Erro inesperado ao criar empresa");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies]);
  
  return { createCompany };
};
