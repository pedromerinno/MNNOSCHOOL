
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { UseCompanyFetchProps } from "../types/fetchTypes";

export const useCompanyDetails = ({
  setError
}: UseCompanyFetchProps) => {
  
  const getCompanyById = useCallback(async (companyId: string): Promise<Company | null> => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      
      return data as Company;
    } catch (error) {
      console.error('Error fetching company by ID:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch company details'));
      return null;
    }
  }, [setError]);

  return { getCompanyById };
};
