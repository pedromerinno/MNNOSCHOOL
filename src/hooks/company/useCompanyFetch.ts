
import { UseCompanyFetchProps, RetryOptions } from "./types/fetchTypes";
import { useCompanyList } from "./fetch/useCompanyList";
import { useUserCompanies } from "./fetch/useUserCompanies";
import { useCompanyDetails } from "./fetch/useCompanyDetails";
import { clearCache } from "./utils/cacheUtils";

export const useCompanyFetch = (props: UseCompanyFetchProps) => {
  const { fetchCompanies, getCompaniesFromCache } = useCompanyList(props);
  const { getUserCompanies, getUserCompaniesFromCache } = useUserCompanies(props);
  const { getCompanyById, getCompanyFromCache } = useCompanyDetails(props);
  
  /**
   * Enhanced fetchCompanies with configurable retry options
   */
  const fetchCompaniesWithRetry = async (options?: Partial<RetryOptions>) => {
    return fetchCompanies(options);
  };
  
  /**
   * Enhanced getUserCompanies with configurable retry options
   */
  const getUserCompaniesWithRetry = async (userId: string, options?: Partial<RetryOptions>) => {
    return getUserCompanies(userId, options);
  };
  
  /**
   * Enhanced getCompanyById with configurable retry options
   */
  const getCompanyByIdWithRetry = async (companyId: string, options?: Partial<RetryOptions>) => {
    return getCompanyById(companyId, options);
  };
  
  /**
   * Force refresh all company data by clearing cache and refetching
   */
  const refreshCompanyData = async (userId?: string) => {
    clearCache();
    await fetchCompanies();
    if (userId) {
      await getUserCompanies(userId);
    }
  };

  return {
    // Original methods
    fetchCompanies,
    getUserCompanies,
    getCompanyById,
    
    // Enhanced methods with retry options
    fetchCompaniesWithRetry,
    getUserCompaniesWithRetry,
    getCompanyByIdWithRetry,
    
    // Cache access methods
    getCompaniesFromCache,
    getUserCompaniesFromCache,
    getCompanyFromCache,
    
    // Utility methods
    refreshCompanyData,
    clearCompanyCache: clearCache
  };
};
