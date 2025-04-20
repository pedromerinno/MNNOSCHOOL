
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

  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    const cachedData = getCachedUserCompanies();
    
    if (didFetchOnPageLoadRef.current && !forceRefresh && userCompanies.length > 0) {
      console.log(`[${hookInstanceIdRef.current}] Already loaded companies this session. Using cached data.`);
      return userCompanies;
    }
    
    if (cachedData && cachedData.length > 0 && !forceRefresh) {
      if (JSON.stringify(userCompanies) !== JSON.stringify(cachedData)) {
        setUserCompanies(cachedData);
      }
      
      if (memoryCache.current.companies && !forceRefresh) {
        console.log(`[${hookInstanceIdRef.current}] Using memory cache to prevent re-rendering.`);
        return cachedData;
      }
    }

    const now = Date.now();
    const timeSinceLastSuccess = now - lastSuccessfulFetchRef.current;
    const COMPONENT_SPECIFIC_THROTTLE = 120000;
    
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
      return userCompanies;
    }
    
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
      
      const cachedData = getCachedUserCompanies();
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
    getCachedUserCompanies,
    executeWithRetry,
    getCompanies,
    setUserCompanies,
    pendingRequestsRef,
    cacheUserCompanies,
    setIsLoading
  ]);
  
  const getCompanyByIdOptimized = useCallback(async (companyId: string): Promise<Company | null> => {
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
