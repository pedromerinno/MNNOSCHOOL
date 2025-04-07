
import { Company } from "@/types/company";

// Cache expiration time in milliseconds (now 10 minutes, was 5 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

export const useCompanyCache = () => {
  /**
   * Store company list in local storage for offline access
   */
  const cacheUserCompanies = (companies: Company[]) => {
    if (companies.length > 0) {
      try {
        localStorage.setItem('userCompanies', JSON.stringify(companies));
        localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
      } catch (e) {
        console.error('Failed to cache user companies', e);
      }
    }
  };

  /**
   * Retrieve cached company list from local storage
   */
  const getCachedUserCompanies = (): Company[] | null => {
    const cachedCompanies = localStorage.getItem('userCompanies');
    if (!cachedCompanies) return null;

    try {
      // Check cache expiration
      if (isCacheExpired()) {
        console.log('Cache is expired, will fetch fresh data');
      }
      
      return JSON.parse(cachedCompanies) as Company[];
    } catch (e) {
      console.error('Error parsing cached companies', e);
      return null;
    }
  };
  
  /**
   * Remove a specific company from the cache
   */
  const removeCachedCompany = (companyId: string): void => {
    try {
      const cachedCompanies = getCachedUserCompanies();
      if (!cachedCompanies) return;
      
      const updatedCompanies = cachedCompanies.filter(company => company.id !== companyId);
      localStorage.setItem('userCompanies', JSON.stringify(updatedCompanies));
      
      // If the selected company was this one, remove it
      const selectedCompanyId = localStorage.getItem('selectedCompanyId');
      if (selectedCompanyId === companyId) {
        localStorage.removeItem('selectedCompanyId');
        localStorage.removeItem('selectedCompany');
      }
      
      console.log(`Removed company ${companyId} from cache`);
    } catch (e) {
      console.error('Failed to remove company from cache', e);
    }
  };

  /**
   * Clear cached company list
   */
  const clearCachedUserCompanies = () => {
    localStorage.removeItem('userCompanies');
    localStorage.removeItem('userCompaniesTimestamp');
    
    // Don't clear selected company here - it will be updated if needed
    console.log('Cleared user companies cache');
  };

  /**
   * Check if we need to refresh cached data
   */
  const isCacheExpired = (): boolean => {
    const timestamp = localStorage.getItem('userCompaniesTimestamp');
    if (!timestamp) return true;
    
    const lastUpdate = parseInt(timestamp, 10);
    const now = Date.now();
    
    const isExpired = (now - lastUpdate) > CACHE_EXPIRATION;
    if (isExpired) {
      console.log(`Cache expired (${Math.round((now - lastUpdate)/1000)}s > ${CACHE_EXPIRATION/1000}s)`);
    }
    
    return isExpired;
  };

  return {
    cacheUserCompanies,
    getCachedUserCompanies,
    clearCachedUserCompanies,
    removeCachedCompany,
    isCacheExpired
  };
};
