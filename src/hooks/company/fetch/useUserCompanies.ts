
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { UseCompanyFetchProps } from "../types/fetchTypes";

export const useUserCompanies = ({ 
  setIsLoading, 
  setUserCompanies, 
  setError 
}: UseCompanyFetchProps) => {
  const getUserCompanies = useCallback(async (userId: string, signal?: AbortSignal) => {
    try {
      const { data: relations, error: relationsError } = await supabase
        .from('user_company')
        .select('company_id')
        .eq('user_id', userId);

      if (relationsError) throw relationsError;
      
      console.log("Found", relations?.length || 0, "company relations");
      
      if (!relations || relations.length === 0) {
        setUserCompanies([]);
        return [];
      }

      const companyIds = relations.map(rel => rel.company_id);
      
      const { data: companies, error: companiesError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', companyIds)
        .order('nome');

      if (companiesError) throw companiesError;
      
      setUserCompanies(companies as Company[]);
      return companies as Company[];
    } catch (error) {
      console.error('Error fetching user companies:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch user companies'));
      return [];
    }
  }, [setUserCompanies, setError]);

  return { getUserCompanies };
};
