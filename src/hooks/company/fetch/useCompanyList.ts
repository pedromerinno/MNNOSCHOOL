
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { UseCompanyFetchProps } from "../types/fetchTypes";

export const useCompanyList = ({ 
  setIsLoading, 
  setCompanies, 
  setError 
}: UseCompanyFetchProps) => {
  
  const fetchCompanies = useCallback(async (): Promise<Company[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');

      if (error) throw error;
      
      const companies = data as Company[];
      if (setCompanies) setCompanies(companies);
      return companies;
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch companies'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, setError]);

  return { fetchCompanies };
};
