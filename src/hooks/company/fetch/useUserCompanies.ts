
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { retryOperation } from "../utils/retryUtils";
import { UseCompanyFetchProps } from "../types/fetchTypes";

// Cache expiration time in ms (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

export const useUserCompanies = ({
  setIsLoading,
  setUserCompanies,
  setSelectedCompany,
  setError,
  incrementFetchCount
}: UseCompanyFetchProps) => {
  
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

  const getUserCompanies = async (userId: string, signal?: AbortSignal): Promise<Company[]> => {
    try {
      setIsLoading(true);
      if (incrementFetchCount) {
        incrementFetchCount();
      }

      // First try to use the RPC function to get user companies
      const { data: companies, error: companiesError } = await supabase
        .rpc('get_user_companies', { user_id: userId });

      if (companiesError) {
        console.error("Error fetching companies via RPC:", companiesError);
        throw companiesError;
      }

      if (companies && Array.isArray(companies)) {
        console.log(`Found ${companies.length} companies for user`);
        setUserCompanies(companies);
        
        // Cache the results
        localStorage.setItem('userCompanies', JSON.stringify(companies));
        localStorage.setItem('userCompaniesTimestamp', Date.now().toString());

        // If only one company, automatically select it
        if (companies.length === 1) {
          setSelectedCompany(companies[0]);
        }
        
        return companies;
      }

      return [];
    } catch (error: any) {
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
    } finally {
      setIsLoading(false);
    }
  };

  return { getUserCompanies };
};
