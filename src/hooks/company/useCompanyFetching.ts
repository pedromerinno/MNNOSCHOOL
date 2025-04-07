
import { useCallback } from "react";
import { Company } from "@/types/company";
import { useCompanyRequest } from "./useCompanyRequest";
import { useCompanyCache } from "./useCompanyCache";
import { useCompanyRetry } from "./useCompanyRetry";
import { useCompanyFetch } from "./useCompanyFetch";

interface UseCompanyFetchingProps {
  userCompanies: Company[];
  setUserCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  incrementFetchCount: () => void;
}

export const useCompanyFetching = ({
  userCompanies,
  setUserCompanies,
  setSelectedCompany,
  setIsLoading,
  setError,
  incrementFetchCount
}: UseCompanyFetchingProps) => {
  const {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    pendingRequestsRef
  } = useCompanyRequest();
  
  const { executeWithRetry } = useCompanyRetry();
  const { 
    getCachedUserCompanies, 
    cacheUserCompanies, 
    clearCachedUserCompanies,
    removeCachedCompany,
    isCacheExpired 
  } = useCompanyCache();
  
  const companyFetchProps = {
    setIsLoading,
    setCompanies: setUserCompanies,
    setUserCompanies,
    setSelectedCompany
  };
  
  const { getCompanyById, getUserCompanies: getCompanies } = useCompanyFetch(companyFetchProps);
  
  /**
   * Fetches user companies with rate limiting and caching
   */
  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    // Check pending requests and log current state
    console.log(`Active requests: ${pendingRequestsRef.current}`);
    
    // If we shouldn't make a request, return cached data
    if (!shouldMakeRequest(forceRefresh, userCompanies.length > 0)) {
      return userCompanies;
    }
    
    // Mark request start
    startRequest();
    setError(null);
    incrementFetchCount();
    
    try {
      // Use cached data for immediate UI update only if not doing a forced refresh
      if (!forceRefresh) {
        const cachedData = getCachedUserCompanies();
        if (cachedData && cachedData.length > 0) {
          setUserCompanies(cachedData);
        }
      }
      
      // Perform request to get updated data
      const result = await executeWithRetry(() => getCompanies(userId));
      
      // Update timestamp of successful request
      completeRequest();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Try to load from cache as last resort
      const cachedData = getCachedUserCompanies();
      if (cachedData && cachedData.length > 0) {
        console.log("Using cached companies after all retries failed");
        setUserCompanies(cachedData);
        return cachedData;
      }
      
      return [];
    } finally {
      // Mark request end
      resetRequestState();
    }
  }, [
    userCompanies,
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    setError,
    incrementFetchCount,
    getCachedUserCompanies,
    executeWithRetry,
    getCompanies,
    setUserCompanies,
    pendingRequestsRef
  ]);
  
  /**
   * Forces a fetch of user companies, ignoring timing checks and clearing cache first
   */
  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log('Forcing user companies fetch and clearing cache first');
    // Clear caches before fetching to ensure we get fresh data
    clearCachedUserCompanies();
    return getUserCompanies(userId, true);
  }, [getUserCompanies, clearCachedUserCompanies]);
  
  return {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById,
    removeCachedCompany
  };
};
