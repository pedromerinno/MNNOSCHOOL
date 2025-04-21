
import { useCallback } from "react";
import { Company } from "@/types/company";
import { useCompanyRequest } from "./fetch/useCompanyRequest";
import { useCompanyCache } from "./useCompanyCache";
import { useCompanyFetch } from "./useCompanyFetch";
import { UseCompanyFetchingProps } from "./types/fetchTypes";
import { useCompanyFetchState } from "./fetch/useCompanyFetchState";
import { useCompanyFetchOperations } from "./fetch/useCompanyFetchOperations";

export const useCompanyFetching = ({
  userCompanies,
  setUserCompanies,
  setSelectedCompany,
  setIsLoading,
  setError,
  incrementFetchCount
}: UseCompanyFetchingProps) => {
  const { shouldMakeRequest, startRequest, completeRequest, resetRequestState } = useCompanyRequest();
  const { getCachedUserCompanies, clearCachedUserCompanies } = useCompanyCache();
  const { getCompanyById, getUserCompanies: getCompanies } = useCompanyFetch({
    setIsLoading,
    setUserCompanies,
    setSelectedCompany,
    setError
  });

  const fetchState = useCompanyFetchState();
  const { executeFetch } = useCompanyFetchOperations(
    userCompanies,
    {
      onSuccess: setUserCompanies,
      onError: setError,
      onLoading: setIsLoading,
      incrementFetchCount
    },
    fetchState
  );

  const getUserCompanies = useCallback(async (
    userId: string, 
    forceRefresh: boolean = false
  ): Promise<Company[]> => {
    const { memoryCacheRef, didFetchOnPageLoadRef } = fetchState;
    const cachedData = getCachedUserCompanies();

    if (memoryCacheRef.current.companies?.length && !forceRefresh) {
      return memoryCacheRef.current.companies;
    }

    if (didFetchOnPageLoadRef.current && !forceRefresh && userCompanies.length > 0) {
      return userCompanies;
    }

    if (!shouldMakeRequest(forceRefresh, userCompanies.length > 0)) {
      return userCompanies.length > 0 ? userCompanies : (cachedData || []);
    }

    startRequest();
    return executeFetch(() => getCompanies(userId, fetchState.abortControllerRef?.current?.signal));
  }, [
    userCompanies,
    shouldMakeRequest,
    startRequest,
    executeFetch,
    getCompanies,
    getCachedUserCompanies,
    fetchState
  ]);

  const getCompanyByIdOptimized = useCallback(async (companyId: string): Promise<Company | null> => {
    const { fetchedCompaniesRef, hookInstanceIdRef } = fetchState;
    
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
  }, [getCompanyById, userCompanies, fetchState]);

  const forceGetUserCompanies = useCallback(async (userId: string): Promise<Company[]> => {
    const { hookInstanceIdRef } = fetchState;
    console.log(`[${hookInstanceIdRef.current}] Forcing user companies fetch and clearing cache first`);
    clearCachedUserCompanies();
    return getUserCompanies(userId, true);
  }, [getUserCompanies, clearCachedUserCompanies, fetchState]);

  return {
    getUserCompanies,
    forceGetUserCompanies,
    getCompanyById: getCompanyByIdOptimized
  };
};
