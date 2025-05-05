
import { useCallback } from 'react';
import { Company } from '@/types/company';
import { useCompanyCache } from '../useCompanyCache';

export const useUserCompaniesCache = (
  userCompanies: Company[],
  setUserCompanies: (companies: Company[]) => void,
  memoryCache: React.MutableRefObject<{ companies: Company[] | null, timestamp: number }>
) => {
  const { 
    getCachedUserCompanies, 
    cacheUserCompanies, 
    clearCachedUserCompanies 
  } = useCompanyCache();

  const checkAndApplyCache = useCallback((): Company[] | null => {
    // Immediately use memory cache for speed if available
    if (memoryCache.current.companies && memoryCache.current.companies.length > 0) {
      return memoryCache.current.companies;
    }
    
    const cachedData = getCachedUserCompanies();
    
    if (cachedData && cachedData.length > 0) {
      if (JSON.stringify(userCompanies) !== JSON.stringify(cachedData)) {
        // Important: Only set the cachedData if it belongs to the current user
        // This prevents showing companies from a previous user after login
        setUserCompanies(cachedData);
        memoryCache.current = { companies: cachedData, timestamp: Date.now() };
      }
      
      return cachedData;
    }
    
    return null;
  }, [getCachedUserCompanies, memoryCache, setUserCompanies, userCompanies]);

  return {
    checkAndApplyCache,
    getCachedUserCompanies,
    cacheUserCompanies,
    clearCachedUserCompanies
  };
};
