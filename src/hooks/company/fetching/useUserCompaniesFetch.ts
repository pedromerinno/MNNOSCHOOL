
import { useCallback } from 'react';
import { Company } from '@/types/company';

interface UseUserCompaniesFetchProps {
  hookInstanceIdRef: React.MutableRefObject<string>;
  fetchInProgressRef: React.MutableRefObject<boolean>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  lastSuccessfulFetchRef: React.MutableRefObject<number>;
  didFetchOnPageLoadRef: React.MutableRefObject<boolean>;
  fetchedCompaniesRef: React.MutableRefObject<Set<string>>;
  memoryCache: React.MutableRefObject<{ companies: Company[] | null, timestamp: number }>;
  userCompanies: Company[];
  setUserCompanies: (companies: Company[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  incrementFetchCount: () => void;
  shouldMakeRequest: (forceRefresh: boolean, hasCachedData: boolean) => boolean;
  startRequest: () => void;
  completeRequest: () => void;
  resetRequestState: () => void;
  executeWithRetry: <T>(operation: () => Promise<T>) => Promise<T>;
  getCompanies: (userId: string, signal?: AbortSignal) => Promise<Company[]>;
  checkAndApplyCache: () => Company[] | null;
  cacheUserCompanies: (companies: Company[]) => void;
}

export const useUserCompaniesFetch = ({
  hookInstanceIdRef,
  fetchInProgressRef,
  abortControllerRef,
  lastSuccessfulFetchRef,
  didFetchOnPageLoadRef,
  fetchedCompaniesRef,
  memoryCache,
  userCompanies,
  setUserCompanies,
  setIsLoading,
  setError,
  incrementFetchCount,
  shouldMakeRequest,
  startRequest,
  completeRequest,
  resetRequestState,
  executeWithRetry,
  getCompanies,
  checkAndApplyCache,
  cacheUserCompanies
}: UseUserCompaniesFetchProps) => {
  
  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    // Check cache first
    const cachedData = checkAndApplyCache();
    
    if (didFetchOnPageLoadRef.current && !forceRefresh && userCompanies.length > 0) {
      console.log(`[${hookInstanceIdRef.current}] Already loaded companies this session. Using cached data.`);
      return userCompanies;
    }
    
    if (cachedData && !forceRefresh) {
      return cachedData;
    }

    const now = Date.now();
    const timeSinceLastSuccess = now - lastSuccessfulFetchRef.current;
    const COMPONENT_SPECIFIC_THROTTLE = 300000; // 5 minutes
    
    if (!forceRefresh && lastSuccessfulFetchRef.current > 0 && 
        timeSinceLastSuccess < COMPONENT_SPECIFIC_THROTTLE && userCompanies.length > 0) {
      console.log(`[${hookInstanceIdRef.current}] Last successful request was ${Math.round(timeSinceLastSuccess/1000)}s ago. Using cached data.`);
      return userCompanies;
    }
    
    if (forceRefresh && abortControllerRef.current) {
      console.log(`[${hookInstanceIdRef.current}] Cancelling previous request due to forced refresh`);
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (fetchInProgressRef.current && !forceRefresh) {
      console.log(`[${hookInstanceIdRef.current}] A fetch operation is already in progress. Skipping duplicate request.`);
      return userCompanies.length > 0 ? userCompanies : (cachedData || []);
    }
    
    if (!shouldMakeRequest(forceRefresh, userCompanies.length > 0)) {
      return userCompanies.length > 0 ? userCompanies : (cachedData || []);
    }

    fetchInProgressRef.current = true;
    startRequest();
    setIsLoading(true);
    setError(null);
    incrementFetchCount();
    
    abortControllerRef.current = new AbortController();
    
    try {
      if (!forceRefresh && cachedData && cachedData.length > 0) {
        setUserCompanies(cachedData);
        // Don't set isLoading to false here to prevent UI flickering
      }
      
      const result = await executeWithRetry(() => getCompanies(userId, abortControllerRef.current?.signal));
      
      completeRequest();
      lastSuccessfulFetchRef.current = Date.now();
      didFetchOnPageLoadRef.current = true;
      
      memoryCache.current = { 
        companies: result, 
        timestamp: Date.now() 
      };
      
      if (result && result.length > 0) {
        cacheUserCompanies(result);
        result.forEach(company => fetchedCompaniesRef.current.add(company.id));
      }
      
      setIsLoading(false);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (error.name === 'AbortError') {
        console.log(`[${hookInstanceIdRef.current}] Request was aborted`);
        setIsLoading(false);
        return userCompanies;
      }
      
      setError(error);
      console.error(`[${hookInstanceIdRef.current}] Error fetching companies:`, error);
      
      if (cachedData && cachedData.length > 0) {
        console.log(`[${hookInstanceIdRef.current}] Using cached companies after failure`);
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
    executeWithRetry,
    getCompanies,
    setUserCompanies,
    cacheUserCompanies,
    setIsLoading,
    checkAndApplyCache,
    hookInstanceIdRef,
    fetchInProgressRef,
    abortControllerRef,
    lastSuccessfulFetchRef,
    didFetchOnPageLoadRef,
    fetchedCompaniesRef,
    memoryCache
  ]);

  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log(`[${hookInstanceIdRef.current}] Forcing user companies fetch and clearing cache first`);
    // We need to implement this separately
    return getUserCompanies(userId, true);
  }, [getUserCompanies, hookInstanceIdRef]);

  return {
    getUserCompanies,
    forceGetUserCompanies
  };
};
