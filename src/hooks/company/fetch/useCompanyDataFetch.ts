
import { useCallback } from "react";
import { Company } from "@/types/company";
import { useCompanyRetry } from './useCompanyRetry';
import { useCompanyRequest } from "./useCompanyRequest";
import { useCompanyCache } from "../useCompanyCache";

export const useCompanyDataFetch = (
  userCompanies: Company[],
  setIsLoading: (loading: boolean) => void,
  setUserCompanies: (companies: Company[]) => void,
  setSelectedCompany: (company: Company | null) => void,
  setError: (error: Error | null) => void,
  incrementFetchCount: () => void
) => {
  const {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
  } = useCompanyRequest();
  
  const { executeWithRetry } = useCompanyRetry();
  const { getCachedUserCompanies, cacheUserCompanies } = useCompanyCache();
  
  const handleFetchSuccess = useCallback((result: Company[]) => {
    if (result && result.length > 0) {
      cacheUserCompanies(result);
    }
    return result;
  }, [cacheUserCompanies]);

  const handleFetchError = useCallback((error: Error) => {
    console.error('Error fetching companies:', error);
    setError(error);
    const cachedData = getCachedUserCompanies();
    if (cachedData && cachedData.length > 0) {
      setUserCompanies(cachedData);
      return cachedData;
    }
    return [];
  }, [getCachedUserCompanies, setUserCompanies, setError]);

  return {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    executeWithRetry,
    handleFetchSuccess,
    handleFetchError
  };
};
