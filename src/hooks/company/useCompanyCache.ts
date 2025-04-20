
import { useCallback } from 'react';
import { Company } from '@/types/company';

export const useCompanyCache = () => {
  /**
   * Get cached user companies from localStorage
   */
  const getCachedUserCompanies = useCallback((): Company[] | null => {
    try {
      const cachedData = localStorage.getItem('userCompanies');
      if (!cachedData) return null;
      
      return JSON.parse(cachedData) as Company[];
    } catch (e) {
      console.error("Error parsing cached companies", e);
      return null;
    }
  }, []);
  
  /**
   * Cache user companies to localStorage
   */
  const cacheUserCompanies = useCallback((companies: Company[]): void => {
    try {
      localStorage.setItem('userCompanies', JSON.stringify(companies));
      localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
    } catch (e) {
      console.error("Error caching companies", e);
    }
  }, []);
  
  /**
   * Clear cached user companies from localStorage
   */
  const clearCachedUserCompanies = useCallback((): void => {
    try {
      localStorage.removeItem('userCompanies');
      localStorage.removeItem('userCompaniesTimestamp');
    } catch (e) {
      console.error("Error clearing cached companies", e);
    }
  }, []);
  
  return {
    getCachedUserCompanies,
    cacheUserCompanies,
    clearCachedUserCompanies
  };
};
