
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
      
      // First check if the user is admin or super_admin - this helps determine which function to use
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
      const isAdmin = profileData?.is_admin || false;
      const isSuperAdmin = profileData?.super_admin || false;
      
      console.log(`User admin status - isAdmin: ${isAdmin}, isSuperAdmin: ${isSuperAdmin}`);
      
      let companiesData;
      
      // Function to get companies for a super admin (all companies)
      const getSuperAdminCompanies = async () => {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');
        if (error) throw error;
        return { data, error };
      };
      
      // Function to get companies for a regular admin (only related companies)
      const getAdminCompanies = async () => {
        const { data, error } = await supabase
          .rpc('get_user_companies', { user_id: userId });
        if (error) throw error;
        return { data, error };
      };
      
      // Function to get companies for a regular user
      const getUserRelatedCompanies = async () => {
        const { data, error } = await supabase
          .rpc('get_user_companies', { user_id: userId });
        if (error) throw error;
        return { data, error };
      };
      
      // Using retryOperation to add automatic retries for database queries
      if (isSuperAdmin) {
        // Super admin: return all companies
        const result = await retryOperation(getSuperAdminCompanies, 3);
        companiesData = result.data;
        console.log(`Super admin fetched ${companiesData?.length || 0} companies`);
      } else if (isAdmin) {
        // Regular admin: return only related companies
        const result = await retryOperation(getAdminCompanies, 3);
        companiesData = result.data;
        console.log(`Admin fetched ${companiesData?.length || 0} related companies`);
      } else {
        // Regular user: return only related companies
        const result = await retryOperation(getUserRelatedCompanies, 3);
        companiesData = result.data;
        console.log(`User fetched ${companiesData?.length || 0} related companies`);
      }

      const companies = companiesData as Company[] || [];
      console.log(`Found ${companies.length} companies for user, isAdmin=${isAdmin}, isSuperAdmin=${isSuperAdmin}`);

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
