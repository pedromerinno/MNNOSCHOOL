
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
   * Fetch user profile to determine admin status
   */
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return {
        isAdmin: data?.is_admin || false,
        isSuperAdmin: data?.super_admin || false
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };

  /**
   * Fetch all companies (for super admins)
   */
  const fetchAllCompanies = async () => {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nome');
      
    if (error) throw error;
    return data || [];
  };

  /**
   * Fetch companies related to user
   */
  const fetchUserRelatedCompanies = async (userId: string) => {
    const { data, error } = await supabase
      .rpc('get_user_companies', { user_id: userId });
      
    if (error) throw error;
    return data || [];
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
      
      // Fetch profile to determine admin status
      let userProfile;
      try {
        userProfile = await retryOperation(() => fetchUserProfile(userId), 3, 1000);
        console.log(`User admin status - isAdmin: ${userProfile.isAdmin}, isSuperAdmin: ${userProfile.isSuperAdmin}`);
      } catch (error) {
        console.warn("Error checking admin status, falling back to regular user mode:", error);
        userProfile = { isAdmin: false, isSuperAdmin: false };
      }
      
      const { isAdmin, isSuperAdmin } = userProfile;
      
      let companiesData;
      
      // Use retryOperation for fetch operations with more retries for network issues
      try {
        if (isSuperAdmin) {
          // Super admin: return all companies
          companiesData = await retryOperation(
            () => fetchAllCompanies(), 
            5, // More retries for network issues
            1000
          );
          console.log(`Super admin fetched ${companiesData?.length || 0} companies`);
        } else {
          // Regular user or admin: return only related companies
          companiesData = await retryOperation(
            () => fetchUserRelatedCompanies(userId),
            5, // More retries for network issues
            1000
          );
          console.log(`${isAdmin ? 'Admin' : 'User'} fetched ${companiesData?.length || 0} related companies`);
        }
      } catch (error: any) {
        console.error("Database fetch failed after retries:", error);
        // If we have cached data, use it as fallback
        if (cachedData.length > 0) {
          console.warn("Using cached data after fetch failure");
          setUserCompanies(cachedData);
          setIsLoading(false);
          return cachedData;
        }
        throw error;
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
