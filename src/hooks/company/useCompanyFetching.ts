
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
    resetRequestState
  } = useCompanyRequest();
  
  const { executeWithRetry } = useCompanyRetry();
  const { getCachedUserCompanies, cacheUserCompanies } = useCompanyCache();
  
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
    // If we shouldn't make a request, return cached data
    if (!shouldMakeRequest(forceRefresh, userCompanies.length > 0)) {
      return userCompanies;
    }
    
    // Mark request start
    startRequest();
    setError(null);
    incrementFetchCount();
    
    try {
      // Use cached data for immediate UI update
      const cachedData = getCachedUserCompanies();
      if (cachedData && cachedData.length > 0) {
        setUserCompanies(cachedData);
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
    setUserCompanies
  ]);
  
  /**
   * Forces a fetch of user companies, ignoring timing checks
   */
  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log('Forcing user companies fetch');
    return getUserCompanies(userId, true);
  }, [getUserCompanies]);
  
  return {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  };
};
