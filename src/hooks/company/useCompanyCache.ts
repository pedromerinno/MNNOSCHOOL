
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
  };

  return {
    cacheUserCompanies,
    getCachedUserCompanies,
    clearCachedUserCompanies
  };
};
