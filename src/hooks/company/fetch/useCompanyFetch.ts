
import { useCallback } from "react";
import { Company } from "@/types/company";
import { useRequestState } from "./useRequestState";
import { useThrottling } from "./useThrottling";
import { useCompanyCache } from "../useCompanyCache";

interface UseCompanyFetchProps {
  userCompanies: Company[];
  setUserCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  incrementFetchCount: () => void;
}

export const useCompanyFetch = ({
  userCompanies,
  setUserCompanies,
  setSelectedCompany,
  setIsLoading,
  setError,
  incrementFetchCount
}: UseCompanyFetchProps) => {
  const { 
    isFetchingRef,
    lastSuccessfulFetchRef,
    abortControllerRef,
    startRequest,
    completeRequest,
    resetRequest
  } = useRequestState();
  
  const { shouldThrottle } = useThrottling();
  const { 
    getCachedUserCompanies, 
    cacheUserCompanies,
    clearCachedUserCompanies 
  } = useCompanyCache();

  const getUserCompanies = useCallback(async (
    userId: string,
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    // Check throttling
    const shouldSkip = shouldThrottle(
      lastSuccessfulFetchRef.current,
      forceRefresh,
      userCompanies.length > 0
    );
    
    if (shouldSkip) {
      console.log(`Last successful fetch was ${Math.round((Date.now() - lastSuccessfulFetchRef.current)/1000)}s ago. Using cached data.`);
      return userCompanies;
    }
    
    // Cancel any existing requests if forcing a refresh
    if (forceRefresh && abortControllerRef.current) {
      console.log('Cancelling previous request due to forced refresh');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // If a fetch is already in progress and not forcing, return current data
    if (isFetchingRef.current && !forceRefresh) {
      console.log('A fetch operation is already in progress. Skipping duplicate fetch.');
      return userCompanies;
    }

    startRequest();
    setIsLoading(true);
    setError(null);
    incrementFetchCount();
    
    abortControllerRef.current = new AbortController();
    
    try {
      // Use cached data for immediate UI update only if not doing a forced refresh
      if (!forceRefresh) {
        const cachedData = getCachedUserCompanies();
        if (cachedData && cachedData.length > 0) {
          setUserCompanies(cachedData);
          console.log("Using cached data while fetching fresh data:", cachedData.length, "companies");
        }
      }
      
      // TODO: Implement actual fetch logic here
      // For now, just return the current companies
      completeRequest();
      return userCompanies;
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        setIsLoading(false);
        return userCompanies;
      }
      
      setError(error);
      console.error("Error fetching companies:", error);
      
      const cachedData = getCachedUserCompanies();
      if (cachedData && cachedData.length > 0) {
        console.log("Using cached companies after all retries failed");
        setUserCompanies(cachedData);
        return cachedData;
      }
      
      return [];
    } finally {
      setIsLoading(false);
      resetRequest();
      abortControllerRef.current = null;
    }
  }, [
    userCompanies,
    setUserCompanies,
    setIsLoading,
    setError,
    incrementFetchCount,
    getCachedUserCompanies,
    cacheUserCompanies
  ]);

  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log('Forcing user companies fetch and clearing cache first');
    clearCachedUserCompanies();
    return getUserCompanies(userId, true);
  }, [getUserCompanies, clearCachedUserCompanies]);

  return {
    getUserCompanies,
    forceGetUserCompanies
  };
};
