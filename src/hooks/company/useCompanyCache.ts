
import { useCallback } from 'react';
import { Company } from '@/types/company';
import { useCache } from '@/hooks/useCache';

const COMPANY_CACHE_KEY = 'userCompanies';
const COMPANY_CACHE_EXPIRATION = 60; // 60 minutes cache expiration - significantly increased

export const useCompanyCache = () => {
  const { setCache, getCache, clearCache } = useCache();
  
  const getCachedUserCompanies = useCallback((): Company[] | null => {
    return getCache<Company[]>({
      key: COMPANY_CACHE_KEY,
      expirationMinutes: COMPANY_CACHE_EXPIRATION
    });
  }, [getCache]);
  
  const cacheUserCompanies = useCallback((companies: Company[]) => {
    setCache<Company[]>(
      {
        key: COMPANY_CACHE_KEY,
        expirationMinutes: COMPANY_CACHE_EXPIRATION
      },
      companies
    );
  }, [setCache]);
  
  const clearCachedUserCompanies = useCallback(() => {
    clearCache(COMPANY_CACHE_KEY);
  }, [clearCache]);
  
  return {
    getCachedUserCompanies,
    cacheUserCompanies,
    clearCachedUserCompanies
  };
};
