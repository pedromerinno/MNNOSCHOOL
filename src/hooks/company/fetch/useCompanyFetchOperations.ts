
import { useCallback } from "react";
import { Company } from "@/types/company";
import { useCompanyFetch } from "../useCompanyFetch";
import { useCompanyDataFetch } from "./useCompanyDataFetch";
import { useCompanyFetchState } from "./useCompanyFetchState";
import { useCompanyCache } from "../useCompanyCache";

export const useCompanyFetchOperations = (props: {
  userCompanies: Company[];
  setUserCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  incrementFetchCount: () => void;
}) => {
  const { userCompanies, setUserCompanies, setSelectedCompany, setIsLoading, setError, incrementFetchCount } = props;
  
  const { getCompanyById: getCompany, getUserCompanies: getCompanies } = useCompanyFetch({
    setIsLoading,
    setUserCompanies,
    setSelectedCompany,
    setError
  });
  
  const {
    fetchInProgressRef,
    abortControllerRef,
    lastSuccessfulFetchRef,
    didFetchOnPageLoadRef,
    hookInstanceIdRef,
    fetchedCompaniesRef,
    memoryCache
  } = useCompanyFetchState();
  
  const {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    executeWithRetry,
    handleFetchSuccess,
    handleFetchError
  } = useCompanyDataFetch(
    userCompanies,
    setIsLoading,
    setUserCompanies,
    setSelectedCompany,
    setError,
    incrementFetchCount
  );
  
  const { clearCachedUserCompanies } = useCompanyCache();

  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    if (didFetchOnPageLoadRef.current && !forceRefresh && userCompanies.length > 0) {
      console.log(`[${hookInstanceIdRef.current}] Already loaded companies this session. Using cached data.`);
      return userCompanies;
    }

    const now = Date.now();
    const timeSinceLastSuccess = now - lastSuccessfulFetchRef.current;
    const COMPONENT_SPECIFIC_THROTTLE = 120000;
    
    if (!forceRefresh && lastSuccessfulFetchRef.current > 0 && 
        timeSinceLastSuccess < COMPONENT_SPECIFIC_THROTTLE && userCompanies.length > 0) {
      return userCompanies;
    }
    
    // Safely abort previous request if exists
    if (forceRefresh && abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (err) {
        console.error('Error aborting previous request:', err);
      }
      abortControllerRef.current = null;
    }
    
    if (fetchInProgressRef.current && !forceRefresh) {
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
      const result = await executeWithRetry(() => getCompanies(userId, abortControllerRef.current?.signal));
      
      completeRequest();
      lastSuccessfulFetchRef.current = Date.now();
      didFetchOnPageLoadRef.current = true;
      
      return handleFetchSuccess(result);
    } catch (err) {
      return handleFetchError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      fetchInProgressRef.current = false;
      setIsLoading(false);
      resetRequestState();
      abortControllerRef.current = null;
    }
  }, [
    userCompanies,
    setIsLoading,
    setError,
    incrementFetchCount,
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    executeWithRetry,
    getCompanies,
    handleFetchSuccess,
    handleFetchError
  ]);

  const getCompanyById = useCallback(async (companyId: string): Promise<Company | null> => {
    if (fetchedCompaniesRef.current.has(companyId) && userCompanies.length > 0) {
      const existingCompany = userCompanies.find(company => company.id === companyId);
      if (existingCompany) {
        return existingCompany;
      }
    }
    
    try {
      const company = await getCompany(companyId);
      if (company) {
        fetchedCompaniesRef.current.add(companyId);
      }
      return company;
    } catch (error) {
      console.error(`[${hookInstanceIdRef.current}] Error fetching company by ID:`, error);
      return null;
    }
  }, [getCompany, userCompanies]);

  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    console.log(`[${hookInstanceIdRef.current}] Forcing user companies fetch and clearing cache first`);
    clearCachedUserCompanies();
    return getUserCompanies(userId, true);
  }, [getUserCompanies, clearCachedUserCompanies]);

  return {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById
  };
};
