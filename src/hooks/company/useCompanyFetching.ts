
import React, { useCallback, useRef } from "react";
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
    setSelectedCompany,
    setError
  };
  
  const { getCompanyById, getUserCompanies: getCompanies } = useCompanyFetch(companyFetchProps);
  
  // Track fetch state to prevent duplicate calls
  const fetchInProgressRef = React.useRef(false);
  // Track abort controllers for active requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  /**
   * Fetches user companies with rate limiting and caching
   */
  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    // Cancel any existing requests if forcing a refresh
    if (forceRefresh && abortControllerRef.current) {
      console.log('Cancelling previous request due to forced refresh');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // If a fetch is already in progress and not forcing, return current data
    if (fetchInProgressRef.current && !forceRefresh) {
      console.log('A fetch operation is already in progress. Skipping duplicate fetch.');
      return userCompanies;
    }
    
    // Check pending requests and log current state
    console.log(`Active requests: ${pendingRequestsRef.current}`);
    
    // If we shouldn't make a request, return cached data
    if (!shouldMakeRequest(forceRefresh, userCompanies.length > 0)) {
      return userCompanies;
    }
    
    // Mark request start and set loading state
    fetchInProgressRef.current = true;
    startRequest();
    setIsLoading(true); // Explicitly set loading to true
    setError(null);
    incrementFetchCount();
    
    // Create a new abort controller for this request
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
      
      // Perform request to get updated data
      const result = await executeWithRetry(() => getCompanies(userId, abortControllerRef.current?.signal));
      
      // Update timestamp of successful request
      completeRequest();
      
      // Cache the companies when we successfully fetch them
      if (result && result.length > 0) {
        cacheUserCompanies(result);
        console.log("Successfully fetched and cached", result.length, "companies");
      }
      
      // Make sure we update loading state with result
      setIsLoading(false);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // Don't show errors for aborted requests
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        setIsLoading(false);
        return userCompanies;
      }
      
      setError(error);
      console.error("Error fetching companies:", error);
      
      // Try to load from cache as last resort
      const cachedData = getCachedUserCompanies();
      if (cachedData && cachedData.length > 0) {
        console.log("Using cached companies after all retries failed");
        setUserCompanies(cachedData);
        return cachedData;
      }
      
      return [];
    } finally {
      // Mark request end and ensure loading state is reset
      fetchInProgressRef.current = false;
      setIsLoading(false); // Ensure loading is set to false even if there was an error
      resetRequestState();
      abortControllerRef.current = null;
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
    pendingRequestsRef,
    cacheUserCompanies,
    setIsLoading
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
