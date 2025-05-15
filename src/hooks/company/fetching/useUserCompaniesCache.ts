
import { useCallback } from 'react';
import { Company } from '@/types/company';

interface UseUserCompaniesCacheProps {
  userCompanies: Company[];
  setUserCompanies: (companies: Company[]) => void;
  memoryCache: React.MutableRefObject<{
    companies: Company[] | null;
    timestamp: number;
  }>;
}

export const useUserCompaniesCache = (
  userCompanies: Company[],
  setUserCompanies: (companies: Company[]) => void,
  memoryCache: React.MutableRefObject<{
    companies: Company[] | null;
    timestamp: number;
  }>
) => {
  const cacheUserCompanies = useCallback((companies: Company[]): void => {
    try {
      if (!companies || companies.length === 0) return;
      
      // Cache in memory
      memoryCache.current = {
        companies,
        timestamp: Date.now()
      };
      
      // Cache in local storage
      localStorage.setItem('userCompanies', JSON.stringify(companies));
      
    } catch (e) {
      console.error('[useUserCompaniesCache] Error caching companies:', e);
    }
  }, [memoryCache]);
  
  const clearCachedUserCompanies = useCallback((): void => {
    localStorage.removeItem('userCompanies');
    memoryCache.current = { companies: null, timestamp: 0 };
  }, [memoryCache]);
  
  const checkAndApplyCache = useCallback((): Company[] | null => {
    try {
      // First check memory cache
      if (memoryCache.current.companies && 
          memoryCache.current.timestamp > 0 && 
          Date.now() - memoryCache.current.timestamp < 5 * 60 * 1000) { // 5 minutes
        
        const cachedCompanies = memoryCache.current.companies;
        if (cachedCompanies.length > 0) {
          console.log('[useUserCompaniesCache] Using memory cache');
          setUserCompanies(cachedCompanies);
          return cachedCompanies;
        }
      }
      
      // Then check localStorage
      const cachedJson = localStorage.getItem('userCompanies');
      if (!cachedJson) return null;
      
      const cachedCompanies = JSON.parse(cachedJson) as Company[];
      if (Array.isArray(cachedCompanies) && cachedCompanies.length > 0) {
        console.log('[useUserCompaniesCache] Using local storage cache');
        setUserCompanies(cachedCompanies);
        
        // Update memory cache
        memoryCache.current = {
          companies: cachedCompanies,
          timestamp: Date.now()
        };
        
        return cachedCompanies;
      }
      
      return null;
    } catch (e) {
      console.error('[useUserCompaniesCache] Error checking cache:', e);
      return null;
    }
  }, [memoryCache, setUserCompanies]);
  
  return {
    checkAndApplyCache,
    cacheUserCompanies,
    clearCachedUserCompanies
  };
};
