
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Company } from '@/types/company';
import { toast } from "sonner";

interface UseCompanyCreateUpdatesProps {
  setIsLoading: (loading: boolean) => void;
  setCompanies: (companies: Company[] | ((prevCompanies: Company[]) => Company[])) => void;
  setError: (error: Error | null) => void;
}

export const useCompanyCreate = ({ 
  setIsLoading, 
  setCompanies 
}: UseCompanyCreateUpdatesProps) => {
  
  const createCompany = useCallback(async (data: Partial<Company> & { nome: string }) => {
    setIsLoading(true);
    try {
      const { data: newCompany, error } = await supabase
        .from('empresas')
        .insert(data)
        .select()
        .single();
  
      if (error) throw error;
  
      if (newCompany) {
        setCompanies(prevCompanies => [...prevCompanies, newCompany as Company]);
        toast.success(`Empresa ${newCompany.nome} criada com sucesso!`);
      }
      
      return newCompany as Company;
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error("Erro ao criar empresa");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies]);
  
  const fetchCompanies = useCallback(async (): Promise<Company[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');
  
      if (error) throw error;
      
      const companies = data as Company[];
      setCompanies(companies);
      return companies;
    } catch (error) {
      console.error('Error fetching all companies:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies]);
  
  return {
    createCompany,
    fetchCompanies
  };
};
