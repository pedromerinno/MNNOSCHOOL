
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { UseCompanyFetchProps } from "../types/fetchTypes";

export const useUserCompanies = ({ 
  setIsLoading, 
  setCompanies, 
  setUserCompanies,
  setError 
}: UseCompanyFetchProps) => {
  const getUserCompanies = useCallback(async (userId: string, signal?: AbortSignal) => {
    try {
      const { data: relations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('empresa_id')
        .eq('user_id', userId);

      if (relationsError) throw relationsError;
      
      console.log("Found", relations?.length || 0, "company relations");
      
      if (!relations || relations.length === 0) {
        setCompanies([]);
        if (setUserCompanies) setUserCompanies([]);
        return [];
      }

      const companyIds = relations.map(rel => rel.empresa_id);
      
      const { data: companies, error: companiesError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', companyIds)
        .order('nome');

      if (companiesError) throw companiesError;
      
      setCompanies(companies as Company[]);
      if (setUserCompanies) setUserCompanies(companies as Company[]);
      return companies as Company[];
    } catch (error) {
      console.error('Error fetching user companies:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch user companies'));
      return [];
    }
  }, [setCompanies, setUserCompanies, setError]);

  return { getUserCompanies };
};
