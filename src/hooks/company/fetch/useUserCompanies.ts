import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { toast } from "sonner";
import { retryOperation } from "../utils/retryUtils";
import { UseCompanyFetchProps } from "../types/fetchTypes";

// Cache expiration time in ms (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

export const useUserCompanies = ({
  setIsLoading,
  setUserCompanies,
  setSelectedCompany,
  setError
}: UseCompanyFetchProps) => {
  /**
   * Check if the companies cache is valid
   */
  const isCacheValid = (): boolean => {
    const cachedData = localStorage.getItem('userCompaniesTimestamp');
    if (!cachedData) return false;
    
    try {
      const timestamp = parseInt(cachedData, 10);
      const now = Date.now();
      return (now - timestamp) < CACHE_EXPIRATION;
    } catch (e) {
      return false;
    }
  };

  /**
   * Gets all companies a user is related to
   */
  const getUserCompanies = async (userId: string, signal?: AbortSignal): Promise<Company[]> => {
    // First check if we already have cached data
    const cachedCompanies = localStorage.getItem('userCompanies');
    let cachedData: Company[] = [];
    
    if (cachedCompanies) {
      try {
        cachedData = JSON.parse(cachedCompanies) as Company[];
        
        if (setUserCompanies) {
          setUserCompanies(cachedData);
        }
        
        if (cachedData.length === 1 && setSelectedCompany) {
          setSelectedCompany(cachedData[0]);
        }
        
        if (isCacheValid() && cachedData.length > 0) {
          setIsLoading(false);
          return cachedData;
        }
      } catch (e) {
        console.error("Error parsing cached companies", e);
      }
    }

    setIsLoading(true);

    try {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      // Primeiro, buscar as relações de empresa do usuário
      const { data: relations, error: relationsError } = await supabase
        .from('user_empresa')
        .select('empresa_id')
        .eq('user_id', userId);

      if (relationsError) {
        console.error("Error fetching user-company relations:", relationsError);
        throw relationsError;
      }

      if (!relations || relations.length === 0) {
        console.log("No companies found for user:", userId);
        setUserCompanies([]);
        setSelectedCompany(null);
        localStorage.removeItem('userCompanies');
        setIsLoading(false);
        return [];
      }

      // Buscar os detalhes das empresas
      const companyIds = relations.map(r => r.empresa_id);
      console.log(`Found ${companyIds.length} company relations`);

      const { data: companies, error: companiesError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', companyIds)
        .order('nome');

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        throw companiesError;
      }

      const userCompaniesData = companies as Company[];
      console.log(`Successfully fetched ${userCompaniesData.length} companies`);

      setUserCompanies(userCompaniesData);

      if (userCompaniesData.length > 0) {
        localStorage.setItem('userCompanies', JSON.stringify(userCompaniesData));
        localStorage.setItem('userCompaniesTimestamp', Date.now().toString());

        if (userCompaniesData.length === 1) {
          setSelectedCompany(userCompaniesData[0]);
        }
      }

      setIsLoading(false);
      return userCompaniesData;
    } catch (error) {
      console.error("Error in getUserCompanies:", error);
      setError(error instanceof Error ? error : new Error("Failed to fetch companies"));
      
      if (cachedData.length > 0) {
        console.log("Using cached data due to error");
        return cachedData;
      }
      
      setIsLoading(false);
      return [];
    }
  };

  return { getUserCompanies };
};
