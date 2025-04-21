
import { useCallback } from "react";
import { useCompanyCache } from "../useCompanyCache";
import { useCompanyRetry } from "./useCompanyRetry";
import { Company } from "@/types/company";
import { CompanyFetchActions } from "../types/fetchingTypes";

export const useCompanyFetchOperations = (
  userCompanies: Company[],
  actions: CompanyFetchActions,
  fetchState: ReturnType<typeof useCompanyFetchState>
) => {
  const { getCachedUserCompanies, cacheUserCompanies } = useCompanyCache();
  const { executeWithRetry } = useCompanyRetry();
  const { 
    fetchInProgressRef,
    abortControllerRef,
    lastSuccessfulFetchRef,
    memoryCacheRef,
    hookInstanceIdRef 
  } = fetchState;

  const handleFetchSuccess = useCallback((result: Company[]) => {
    lastSuccessfulFetchRef.current = Date.now();
    
    memoryCacheRef.current = { 
      companies: result, 
      timestamp: Date.now() 
    };
    
    if (result?.length > 0) {
      cacheUserCompanies(result);
    }
    
    actions.onSuccess(result);
  }, [actions, cacheUserCompanies]);

  const handleFetchError = useCallback((error: Error) => {
    console.error(`[${hookInstanceIdRef.current}] Error fetching companies:`, error);
    actions.onError(error);
    
    const cachedData = getCachedUserCompanies();
    if (cachedData?.length > 0) {
      console.log(`[${hookInstanceIdRef.current}] Using cached companies after failure`);
      actions.onSuccess(cachedData);
    }
  }, [actions, getCachedUserCompanies, hookInstanceIdRef]);

  const executeFetch = useCallback(async (
    operation: () => Promise<Company[]>,
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    if (fetchInProgressRef.current && !forceRefresh) {
      console.log(`[${hookInstanceIdRef.current}] A fetch operation is already in progress`);
      return userCompanies;
    }

    fetchInProgressRef.current = true;
    actions.onLoading(true);
    actions.incrementFetchCount();
    
    try {
      const result = await executeWithRetry(operation);
      handleFetchSuccess(result);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`[${hookInstanceIdRef.current}] Request was aborted`);
        return userCompanies;
      }
      handleFetchError(error instanceof Error ? error : new Error('Unknown error'));
      return [];
    } finally {
      fetchInProgressRef.current = false;
      actions.onLoading(false);
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
    }
  }, [
    userCompanies,
    executeWithRetry,
    actions,
    handleFetchSuccess,
    handleFetchError,
    hookInstanceIdRef
  ]);

  return { executeFetch };
};

