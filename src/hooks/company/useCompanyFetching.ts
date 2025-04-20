
import React, { useCallback, useRef } from "react";
import { Company } from "@/types/company";
import { useCompanyRequest } from "./useCompanyRequest";
import { useCompanyCache } from "./useCompanyCache";
import { useCompanyRetry } from "./useCompanyRetry";
import { useCompanyFetch } from "./useCompanyFetch";
import { retryOperation } from "./utils/retryUtils";

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
    clearCachedUserCompanies 
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
  const fetchInProgressRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSuccessfulFetchRef = useRef<number>(0);
  const consecutiveErrorsRef = useRef<number>(0);
  
  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    const now = Date.now();
    const timeSinceLastSuccess = now - lastSuccessfulFetchRef.current;
    const COMPONENT_SPECIFIC_THROTTLE = 30000; // 30 seconds
    
    if (!forceRefresh && lastSuccessfulFetchRef.current > 0 && 
        timeSinceLastSuccess < COMPONENT_SPECIFIC_THROTTLE && userCompanies.length > 0) {
      console.log(`[useCompanyFetching] Last successful fetch was ${Math.round(timeSinceLastSuccess/1000)}s ago. Using cached data.`);
      return userCompanies;
    }
    
    if (forceRefresh && abortControllerRef.current) {
      console.log('Cancelling previous request due to forced refresh');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (fetchInProgressRef.current && !forceRefresh) {
      console.log('A fetch operation is already in progress. Skipping duplicate fetch.');
      return userCompanies;
    }
    
    console.log(`Active requests: ${pendingRequestsRef.current}`);
    
    if (!shouldMakeRequest(forceRefresh, userCompanies.length > 0)) {
      return userCompanies;
    }
    
    fetchInProgressRef.current = true;
    startRequest();
    setIsLoading(true);
    setError(null);
    incrementFetchCount();
    
    abortControllerRef.current = new AbortController();
    
    try {
      if (!forceRefresh) {
        const cachedData = getCachedUserCompanies();
        if (cachedData && cachedData.length > 0) {
          setUserCompanies(cachedData);
          console.log("Using cached data while fetching fresh data:", cachedData.length, "companies");
        }
      }
      
      // Using retryOperation directly with more retries for network issues
      const fetchWithRetry = async () => {
        return await getCompanies(userId, abortControllerRef.current?.signal);
      };
      
      const result = await retryOperation(
        fetchWithRetry, 
        consecutiveErrorsRef.current > 2 ? 5 : 3, // Increase retries after multiple failures
        1000,
        15000
      );
      
      completeRequest();
      lastSuccessfulFetchRef.current = Date.now();
      consecutiveErrorsRef.current = 0; // Reset error counter on success
      
      if (result && result.length > 0) {
        cacheUserCompanies(result);
        console.log("Successfully fetched and cached", result.length, "companies");
      }
      
      setIsLoading(false);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        setIsLoading(false);
        return userCompanies;
      }
      
      consecutiveErrorsRef.current += 1; // Track consecutive errors
      
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
      fetchInProgressRef.current = false;
      setIsLoading(false);
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
  
  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log('Forcing user companies fetch and clearing cache first');
    clearCachedUserCompanies();
    return getUserCompanies(userId, true);
  }, [getUserCompanies, clearCachedUserCompanies]);
  
  return {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  };
};
