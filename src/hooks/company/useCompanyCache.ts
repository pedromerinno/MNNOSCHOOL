
import { Company } from "@/types/company";
import { useCache } from "@/hooks/useCache";

// Increase cache time to reduce API calls
const CACHE_EXPIRATION_MINUTES = 120; // 2 hours cache

/**
 * Hook for caching company data to reduce API calls
 */
export const useCompanyCache = () => {
  const { setCache, getCache, clearCache } = useCache();
  
  // Cache keys
  const USER_COMPANIES_KEY = 'userCompanies';
  
  /**
   * Check if the cache has expired
   */
  const isCacheExpired = (): boolean => {
    const companies = getCachedUserCompanies();
    return !companies;
  };
  
  /**
   * Get cached user companies
   */
  const getCachedUserCompanies = (): Company[] | null => {
    return getCache<Company[]>({
      key: USER_COMPANIES_KEY,
      expirationMinutes: CACHE_EXPIRATION_MINUTES
    });
  };
  
  /**
   * Cache user companies
   */
  const cacheUserCompanies = (companies: Company[]): void => {
    if (!companies || companies.length === 0) {
      console.log("[Company Cache] No companies to cache, skipping");
      return;
    }
    
    setCache({
      key: USER_COMPANIES_KEY,
      expirationMinutes: CACHE_EXPIRATION_MINUTES
    }, companies);
  };
  
  /**
   * Clear cached user companies
   */
  const clearCachedUserCompanies = (): void => {
    clearCache(USER_COMPANIES_KEY);
  };
  
  /**
   * Remove a company from cache
   */
  const removeCachedCompany = (companyId: string): void => {
    try {
      const companies = getCachedUserCompanies();
      if (!companies) return;
      
      const updatedCompanies = companies.filter(company => company.id !== companyId);
      cacheUserCompanies(updatedCompanies);
      console.log(`[Company Cache] Removed company ${companyId} from cache`);
    } catch (e) {
      console.error("[Company Cache] Error removing company from cache:", e);
    }
  };
  
  return {
    getCachedUserCompanies,
    cacheUserCompanies,
    clearCachedUserCompanies,
    removeCachedCompany,
    isCacheExpired
  };
};
