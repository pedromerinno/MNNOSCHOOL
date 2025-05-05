
import { useCallback } from "react";
import { Company } from "@/types/company";
import { useCompanyRequest } from "./useCompanyRequest";
import { useCompanyRetry } from "./useCompanyRetry";
import { useCompanyFetch } from "./useCompanyFetch";
import { UseCompanyFetchingProps } from "./types/fetchTypes";
import { useCompanyFetchingState } from "./fetching/useCompanyFetchingState";
import { useUserCompaniesCache } from "./fetching/useUserCompaniesCache";
import { useCompanyGetById } from "./fetching/useCompanyGetById";
import { useUserCompaniesFetch } from "./fetching/useUserCompaniesFetch";

export const useCompanyFetching = ({
  userCompanies,
  setUserCompanies,
  setSelectedCompany,
  setIsLoading,
  setError,
  incrementFetchCount
}: UseCompanyFetchingProps) => {
  // Get the request management hooks
  const {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState
  } = useCompanyRequest();
  
  // Get the retry logic hook
  const { executeWithRetry } = useCompanyRetry();
  
  // Get the company fetch API hooks
  const companyFetchProps = {
    setIsLoading,
    setUserCompanies,
    setSelectedCompany,
    setError
  };
  
  const { getCompanyById, getUserCompanies: getCompanies } = useCompanyFetch(companyFetchProps);
  
  // Get the state management hooks
  const {
    fetchInProgressRef,
    abortControllerRef,
    lastSuccessfulFetchRef,
    didFetchOnPageLoadRef,
    hookInstanceIdRef,
    fetchedCompaniesRef,
    memoryCache
  } = useCompanyFetchingState();

  // Get the caching hooks
  const {
    checkAndApplyCache,
    cacheUserCompanies,
    clearCachedUserCompanies
  } = useUserCompaniesCache(userCompanies, setUserCompanies, memoryCache);

  // Get the company by ID optimization hook
  const { getCompanyByIdOptimized } = useCompanyGetById(
    getCompanyById,
    userCompanies,
    fetchedCompaniesRef,
    hookInstanceIdRef
  );

  // Get the user companies fetch hook
  const { getUserCompanies, forceGetUserCompanies } = useUserCompaniesFetch({
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
  });

  // We need a way to clear cache and then fetch, modify forceGetUserCompanies to do this
  const forceGetUserCompaniesWithCacheClear = useCallback(async (userId: string): Promise<Company[]> => {
    console.log(`[${hookInstanceIdRef.current}] Forcing user companies fetch and clearing cache first`);
    clearCachedUserCompanies();
    return forceGetUserCompanies(userId);
  }, [forceGetUserCompanies, clearCachedUserCompanies, hookInstanceIdRef]);
  
  return {
    getUserCompanies,
    forceGetUserCompanies: forceGetUserCompaniesWithCacheClear,
    getCompanyById: getCompanyByIdOptimized
  };
};
