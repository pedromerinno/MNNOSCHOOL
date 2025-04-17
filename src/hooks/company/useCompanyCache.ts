
import { Company } from "@/types/company";

// Time to cache in minutes
const CACHE_EXPIRATION_MINUTES = 60; // 1 hour cache

/**
 * Hook for caching company data to reduce API calls
 */
export const useCompanyCache = () => {
  // Cache keys
  const USER_COMPANIES_KEY = 'userCompanies';
  const USER_COMPANIES_TIMESTAMP_KEY = 'userCompaniesTimestamp';
  
  /**
   * Check if the cache has expired
   */
  const isCacheExpired = (): boolean => {
    try {
      const timestampStr = localStorage.getItem(USER_COMPANIES_TIMESTAMP_KEY);
      if (!timestampStr) return true;
      
      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      const minutesSinceLastCache = (now - timestamp) / (1000 * 60);
      
      return minutesSinceLastCache > CACHE_EXPIRATION_MINUTES;
    } catch (e) {
      console.error("[Company Cache] Error checking cache expiration:", e);
      return true;
    }
  };
  
  /**
   * Get cached user companies
   */
  const getCachedUserCompanies = (): Company[] | null => {
    try {
      const cachedData = localStorage.getItem(USER_COMPANIES_KEY);
      if (!cachedData) return null;
      
      const companies = JSON.parse(cachedData) as Company[];
      console.log(`[Company Cache] Retrieved ${companies.length} companies from cache`);
      return companies;
    } catch (e) {
      console.error("[Company Cache] Error retrieving companies from cache:", e);
      return null;
    }
  };
  
  /**
   * Cache user companies
   */
  const cacheUserCompanies = (companies: Company[]): void => {
    try {
      localStorage.setItem(USER_COMPANIES_KEY, JSON.stringify(companies));
      localStorage.setItem(USER_COMPANIES_TIMESTAMP_KEY, Date.now().toString());
      console.log(`[Company Cache] Cached ${companies.length} companies`);
    } catch (e) {
      console.error("[Company Cache] Error caching companies:", e);
    }
  };
  
  /**
   * Clear cached user companies
   */
  const clearCachedUserCompanies = (): void => {
    try {
      localStorage.removeItem(USER_COMPANIES_KEY);
      localStorage.removeItem(USER_COMPANIES_TIMESTAMP_KEY);
      console.log("[Company Cache] Cleared companies cache");
    } catch (e) {
      console.error("[Company Cache] Error clearing cache:", e);
    }
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
