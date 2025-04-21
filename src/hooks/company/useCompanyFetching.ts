
import { useCallback, useRef } from "react";
import { Company } from "@/types/company";
import { useCompanyRequest } from "./fetch/useCompanyRequest";
import { useCompanyCache } from "./useCompanyCache";
import { useCompanyRetry } from "./fetch/useCompanyRetry";
import { useCompanyFetch } from "./useCompanyFetch";
import { UseCompanyFetchingProps } from "./types/fetchTypes";

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
    setUserCompanies,
    setSelectedCompany,
    setError
  };
  
  const { getCompanyById, getUserCompanies: getCompanies } = useCompanyFetch(companyFetchProps);
  
  // State for tracking requests
  const fetchInProgressRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSuccessfulFetchRef = useRef<number>(0);
  const didFetchOnPageLoadRef = useRef<boolean>(false);
  const hookInstanceIdRef = useRef<string>(`fetch-${Math.random().toString(36).substring(2, 9)}`);
  const fetchedCompaniesRef = useRef<Set<string>>(new Set());
  const memoryCache = useRef<{ 
    companies: Company[] | null, 
    timestamp: number 
  }>({ companies: null, timestamp: 0 });

  // Request coalescing - prevent multiple simultaneous requests
  const pendingRequestsMapRef = useRef<Map<string, Promise<Company[]>>>(new Map());

  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    const requestId = `user-companies-${userId}-${forceRefresh ? 'force' : 'normal'}`;
    
    // If there's already a pending request for the same data, return that promise
    if (pendingRequestsMapRef.current.has(requestId) && !forceRefresh) {
      console.log(`[${hookInstanceIdRef.current}] Reusing pending request for user companies`);
      return pendingRequestsMapRef.current.get(requestId)!;
    }
    
    // Immediately use memory cache for speed if available
    if (memoryCache.current.companies && 
        memoryCache.current.companies.length > 0 && 
        !forceRefresh && 
        Date.now() - memoryCache.current.timestamp < 60000) { // 1 minute cache
      console.log(`[${hookInstanceIdRef.current}] Using memory cache for immediate response`);
      return memoryCache.current.companies;
    }
    
    if (didFetchOnPageLoadRef.current && !forceRefresh && userCompanies.length > 0) {
      console.log(`[${hookInstanceIdRef.current}] Already loaded companies this session. Using cached data.`);
      return userCompanies;
    }
    
    const cachedData = getCachedUserCompanies();
    if (cachedData && cachedData.length > 0 && !forceRefresh) {
      if (JSON.stringify(userCompanies) !== JSON.stringify(cachedData)) {
        // Only set the cachedData if it belongs to the current user
        setUserCompanies(cachedData);
        memoryCache.current = { companies: cachedData, timestamp: Date.now() };
      }
      
      if (memoryCache.current.companies && !forceRefresh) {
        console.log(`[${hookInstanceIdRef.current}] Using memory cache to prevent re-rendering.`);
        return cachedData;
      }
    }

    const now = Date.now();
    const timeSinceLastSuccess = now - lastSuccessfulFetchRef.current;
    const THROTTLE_DURATION = 10000; // 10 seconds
    
    if (!forceRefresh && lastSuccessfulFetchRef.current > 0 && 
        timeSinceLastSuccess < THROTTLE_DURATION && userCompanies.length > 0) {
      console.log(`[${hookInstanceIdRef.current}] Last successful request was ${Math.round(timeSinceLastSuccess/1000)}s ago. Rate limiting.`);
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
    
    // Create the fetch promise
    const fetchPromise = (async () => {
      try {
        if (!forceRefresh) {
          const cachedData = getCachedUserCompanies();
          if (cachedData && cachedData.length > 0) {
            setUserCompanies(cachedData);
          }
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
        
        // Remove this promise from the pending map
        setTimeout(() => {
          pendingRequestsMapRef.current.delete(requestId);
        }, 0);
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        
        if (error.name === 'AbortError') {
          console.log(`[${hookInstanceIdRef.current}] Request was aborted`);
          setIsLoading(false);
          
          // Remove this promise from the pending map
          pendingRequestsMapRef.current.delete(requestId);
          
          return userCompanies;
        }
        
        setError(error);
        console.error(`[${hookInstanceIdRef.current}] Error fetching companies:`, error);
        
        const cachedData = getCachedUserCompanies();
        if (cachedData && cachedData.length > 0) {
          console.log(`[${hookInstanceIdRef.current}] Using cached companies after failure`);
          setUserCompanies(cachedData);
          return cachedData;
        }
        
        // Remove this promise from the pending map
        pendingRequestsMapRef.current.delete(requestId);
        
        return [];
      } finally {
        fetchInProgressRef.current = false;
        setIsLoading(false);
        resetRequestState();
        abortControllerRef.current = null;
      }
    })();
    
    // Store this promise for future reuse
    pendingRequestsMapRef.current.set(requestId, fetchPromise);
    
    return fetchPromise;
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
  
  const getCompanyByIdOptimized = useCallback(async (companyId: string): Promise<Company | null> => {
    // Fast path: check memory cache first
    if (fetchedCompaniesRef.current.has(companyId) && userCompanies.length > 0) {
      const existingCompany = userCompanies.find(company => company.id === companyId);
      if (existingCompany) {
        console.log(`[${hookInstanceIdRef.current}] Company ${companyId} found in memory cache`);
        return existingCompany;
      }
    }
    
    try {
      const company = await getCompanyById(companyId);
      if (company) {
        fetchedCompaniesRef.current.add(companyId);
      }
      return company;
    } catch (error) {
      console.error(`[${hookInstanceIdRef.current}] Error fetching company by ID:`, error);
      return null;
    }
  }, [getCompanyById, userCompanies]);
  
  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log(`[${hookInstanceIdRef.current}] Forcing user companies fetch and clearing cache first`);
    clearCachedUserCompanies();
    return getUserCompanies(userId, true);
  }, [getUserCompanies, clearCachedUserCompanies]);
  
  return {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById: getCompanyByIdOptimized
  };
};
