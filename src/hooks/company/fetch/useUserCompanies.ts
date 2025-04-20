
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
   * Gets all companies a user is related to using the database function
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
    if (incrementFetchCount) {
      incrementFetchCount();
    }

    try {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      
      // First check if the user is admin - this helps determine which function to use
      const profileResponse = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', userId)
        .single();
        
      if (profileResponse.error) {
        console.error("Error fetching user profile:", profileResponse.error);
        throw profileResponse.error;
      }
      
      const profileData = profileResponse.data;
      const isAdmin = profileData?.is_admin || profileData?.super_admin || false;
      console.log(`User is admin: ${isAdmin}`);
      
      let companiesData;
      
      // Using retryOperation to add automatic retries for database queries
      if (isAdmin) {
        // Admin: use the function that returns all companies for admins
        const response = await retryOperation(() => 
          supabase.rpc('get_user_companies_for_admin', { current_user_id: userId }), 3);
        
        if (response.error) throw response.error;
        companiesData = response.data;
      } else {
        // Normal user: fetch only linked companies
        const response = await retryOperation(() => 
          supabase.rpc('get_user_companies', { user_id: userId }), 3);
        
        if (response.error) throw response.error;
        companiesData = response.data;
      }

      const companies = companiesData as Company[] || [];
      console.log(`Found ${companies.length} companies for user, isAdmin=${isAdmin}`);

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
      
      setIsLoading(false);
      return [];
    }
  };

  return { getUserCompanies };
};
