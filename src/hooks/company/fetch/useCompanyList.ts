
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';
import { UseCompanyFetchProps } from '../types/fetchTypes';

export const useCompanyList = ({
  setIsLoading,
  setCompanies,
  setError
}: UseCompanyFetchProps) => {
  
  const fetchCompanies = useCallback(async (): Promise<Company[]> => {
    if (!setCompanies) {
      console.error('setCompanies not provided');
      return [];
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');
        
      if (error) throw error;
      
      setCompanies(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch companies'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCompanies, setError]);
  
  return { fetchCompanies };
};
