
import { useCallback } from 'react';
import { Company } from '@/types/company';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';

export const useCompanyCache = () => {
  const { getCache, setCache, clearCache, isCacheReady, startCacheOperation, endCacheOperation } = useOptimizedCache();

  // Buscar empresas do usuário do cache
  const getCachedUserCompanies = useCallback((): Company[] | null => {
    try {
      if (!isCacheReady('userCompanies')) {
        return null;
      }
      
      const companies = getCache<Company[]>('userCompanies');
      if (companies && Array.isArray(companies) && companies.length > 0) {
        return companies;
      }
      return null;
    } catch (error) {
      console.error('Error getting cached user companies:', error);
      return null;
    }
  }, [getCache, isCacheReady]);

  // Armazenar empresas do usuário no cache
  const cacheUserCompanies = useCallback((companies: Company[]) => {
    try {
      if (Array.isArray(companies)) {
        setCache('userCompanies', companies, 15); // Cache por 15 minutos
        console.log(`[CompanyCache] Cached ${companies.length} user companies`);
      }
    } catch (error) {
      console.error('Error caching user companies:', error);
    }
  }, [setCache]);

  // Limpar cache de empresas do usuário
  const clearCachedUserCompanies = useCallback(() => {
    try {
      clearCache('userCompanies');
      console.log('[CompanyCache] Cleared user companies cache');
    } catch (error) {
      console.error('Error clearing cached user companies:', error);
    }
  }, [clearCache]);

  // Obter empresa selecionada inicialmente (do cache)
  const getInitialSelectedCompany = useCallback((): Company | null => {
    try {
      if (!isCacheReady('selectedCompany')) {
        return null;
      }
      
      const company = getCache<Company>('selectedCompany');
      if (company && company.id) {
        // Verificar se o usuário tem acesso a esta empresa
        const cachedUserCompanies = getCachedUserCompanies();
        if (cachedUserCompanies) {
          const hasAccess = cachedUserCompanies.some(c => c.id === company.id);
          if (!hasAccess) {
            console.log('[CompanyCache] User no longer has access to cached company, clearing selection');
            clearCache('selectedCompany');
            return null;
          }
        }
        return company;
      }
      return null;
    } catch (error) {
      console.error('Error getting initial selected company:', error);
      return null;
    }
  }, [getCache, getCachedUserCompanies, clearCache, isCacheReady]);

  // Cache da empresa selecionada
  const cacheSelectedCompany = useCallback((company: Company | null) => {
    try {
      if (company) {
        setCache('selectedCompany', company, 30); // Cache por 30 minutos
        console.log(`[CompanyCache] Cached selected company: ${company.nome}`);
      } else {
        clearCache('selectedCompany');
      }
    } catch (error) {
      console.error('Error caching selected company:', error);
    }
  }, [setCache, clearCache]);

  // Iniciar operação de cache
  const startCompanyCacheOperation = useCallback((key: string) => {
    startCacheOperation(key);
  }, [startCacheOperation]);

  // Finalizar operação de cache
  const endCompanyCacheOperation = useCallback((key: string) => {
    endCacheOperation(key);
  }, [endCacheOperation]);

  // Verificar se cache está pronto
  const isCompanyCacheReady = useCallback((key: string) => {
    return isCacheReady(key);
  }, [isCacheReady]);

  return {
    getCachedUserCompanies,
    cacheUserCompanies,
    clearCachedUserCompanies,
    getInitialSelectedCompany,
    cacheSelectedCompany,
    startCompanyCacheOperation,
    endCompanyCacheOperation,
    isCompanyCacheReady
  };
};
