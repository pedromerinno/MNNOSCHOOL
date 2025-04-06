
import { Company } from "@/types/company";

export const useCompanyCache = () => {
  /**
   * Store company list in local storage for offline access
   */
  const cacheUserCompanies = (companies: Company[]) => {
    if (companies.length > 0) {
      try {
        localStorage.setItem('userCompanies', JSON.stringify(companies));
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
      return JSON.parse(cachedCompanies) as Company[];
    } catch (e) {
      console.error('Error parsing cached companies', e);
      return null;
    }
  };

  /**
   * Clear cached company list
   */
  const clearCachedUserCompanies = () => {
    localStorage.removeItem('userCompanies');
    localStorage.removeItem('userCompaniesTimestamp');
    
    // Also clear selected company if present
    if (localStorage.getItem('selectedCompanyId')) {
      localStorage.removeItem('selectedCompanyId');
      localStorage.removeItem('selectedCompany');
    }
  };

  /**
   * Check if we need to refresh cached data
   */
  const isCacheExpired = (): boolean => {
    const timestamp = localStorage.getItem('userCompaniesTimestamp');
    if (!timestamp) return true;
    
    const lastUpdate = parseInt(timestamp, 10);
    const now = Date.now();
    
    // Cache expires after 5 minutes (300000 ms)
    return (now - lastUpdate) > 300000;
  };

  return {
    cacheUserCompanies,
    getCachedUserCompanies,
    clearCachedUserCompanies,
    isCacheExpired
  };
};
