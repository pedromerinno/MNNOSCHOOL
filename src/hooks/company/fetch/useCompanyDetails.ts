
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';
import { UseCompanyFetchProps } from '../types/fetchTypes';

export const useCompanyDetails = ({
  setIsLoading,
  setSelectedCompany,
  setError
}: UseCompanyFetchProps) => {
  
  const getCompanyById = useCallback(async (companyId: string): Promise<Company | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', companyId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setSelectedCompany(data);
      }
      
      return data;
    } catch (err) {
      console.error("Error fetching company by ID:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch company'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setSelectedCompany, setError]);
  
  return { getCompanyById };
};
