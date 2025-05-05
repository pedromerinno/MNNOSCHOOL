
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { UseCompanyFetchProps } from "../types/fetchTypes";

export const useUserCompanies = ({
  setUserCompanies,
  setError
}: UseCompanyFetchProps) => {
  
  const getUserCompanies = useCallback(async (userId: string, signal?: AbortSignal): Promise<Company[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_companies', { user_id: userId })
        .abortSignal(signal);

      if (error) throw error;
      
      const companies = data as Company[];
      setUserCompanies(companies);
      return companies;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted');
        return [];
      }
      
      console.error('Error fetching user companies:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch user companies'));
      return [];
    }
  }, [setUserCompanies, setError]);

  return { getUserCompanies };
};
