import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { retryOperation } from "../utils/retryUtils";
import { UseCompanyFetchProps } from "../types/fetchTypes";
import { checkIfUserIsAdmin, checkIfUserIsSuperAdmin } from '@/utils/adminUtils';

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
      
      // Utilize a nova função do banco de dados para obter as empresas do usuário
      const { data, error } = await supabase
        .rpc('get_user_companies_for_admin', { current_user_id: userId });
        
      if (error) {
        throw error;
      }

      const companies = data as Company[] || [];
      console.log(`Found ${companies.length} companies for user`);

      if (companies.length > 0) {
        setUserCompanies(companies);
        localStorage.setItem('userCompanies', JSON.stringify(companies));
        localStorage.setItem('userCompaniesTimestamp', Date.now().toString());

        if (companies.length === 1) {
          setSelectedCompany(companies[0]);
        }
      }

      setIsLoading(false);
      return companies;

    } catch (error) {
      console.error("Error in getUserCompanies:", error);
      setError(error instanceof Error ? error : new Error("Failed to fetch companies"));
      
      // Try to load from cache as last resort
      const cachedData = localStorage.getItem('userCompanies');
      if (cachedData) {
        try {
          const cachedCompanies = JSON.parse(cachedData) as Company[];
          if (cachedCompanies && cachedCompanies.length > 0) {
            console.log("Using cached companies after error");
            setUserCompanies(cachedCompanies);
            return cachedCompanies;
          }
        } catch (e) {
          console.error("Error parsing cached companies", e);
        }
      }
      
      return [];
    }
  };

  return { getUserCompanies };
};
