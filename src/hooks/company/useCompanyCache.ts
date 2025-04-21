
import { useCallback } from 'react';
import { Company } from '@/types/company';

export const useCompanyCache = () => {
  // Chave de timestamp única para invalidação de cache
  const CACHE_VERSION_KEY = 'company_cache_version';
  
  // Gerar nova versão de cache
  const generateNewCacheVersion = useCallback(() => {
    const newVersion = Date.now().toString();
    localStorage.setItem(CACHE_VERSION_KEY, newVersion);
    return newVersion;
  }, []);
  
  // Obter versão atual do cache
  const getCurrentCacheVersion = useCallback(() => {
    return localStorage.getItem(CACHE_VERSION_KEY) || generateNewCacheVersion();
  }, [generateNewCacheVersion]);
  
  // Buscar empresas do usuário do cache
  const getCachedUserCompanies = useCallback((): Company[] | null => {
    try {
      const cachedData = localStorage.getItem('userCompanies');
      const cachedTimestamp = localStorage.getItem('userCompaniesTimestamp');
      
      if (!cachedData || !cachedTimestamp) return null;
      
      // Verificar se o cache não está expirado (5 minutos)
      const now = Date.now();
      const cacheTime = parseInt(cachedTimestamp);
      if (now - cacheTime > 5 * 60 * 1000) return null;
      
      if (cachedData) {
        const companies = JSON.parse(cachedData);
        if (Array.isArray(companies) && companies.length > 0) {
          return companies;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached user companies:', error);
      return null;
    }
  }, []);

  // Armazenar empresas do usuário no cache
  const cacheUserCompanies = useCallback((companies: Company[]) => {
    try {
      if (Array.isArray(companies) && companies.length > 0) {
        localStorage.setItem('userCompanies', JSON.stringify(companies));
        localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
      }
    } catch (error) {
      console.error('Error caching user companies:', error);
    }
  }, []);

  // Limpar cache de empresas do usuário
  const clearCachedUserCompanies = useCallback(() => {
    try {
      localStorage.removeItem('userCompanies');
      localStorage.removeItem('userCompaniesTimestamp');
      localStorage.removeItem('userCompaniesUserId');
      localStorage.removeItem('selectedCompany');
      localStorage.removeItem('selectedCompanyId');
      localStorage.removeItem('selectedCompanyName');
      // Gerar nova versão de cache para invalidar todos os caches relacionados
      generateNewCacheVersion();
      console.log('All company cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cached user companies:', error);
    }
  }, [generateNewCacheVersion]);

  // Obter empresa selecionada inicialmente (do cache)
  const getInitialSelectedCompany = useCallback((): Company | null => {
    try {
      const cachedCompany = localStorage.getItem('selectedCompany');
      const cachedVersion = localStorage.getItem('selectedCompanyVersion');
      const currentVersion = getCurrentCacheVersion();
      
      // Se a versão do cache não corresponder à versão atual, invalidar
      if (cachedVersion !== currentVersion) {
        console.log('Company cache version mismatch, invalidating cache');
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompanyId');
        localStorage.removeItem('selectedCompanyName');
        return null;
      }
      
      if (cachedCompany) {
        const company = JSON.parse(cachedCompany);
        if (company && company.id) {
          // Verificar se o usuário tem acesso a esta empresa
          const cachedUserCompanies = getCachedUserCompanies();
          if (cachedUserCompanies) {
            const hasAccess = cachedUserCompanies.some(c => c.id === company.id);
            if (!hasAccess) {
              console.log('Usuário não tem acesso à empresa em cache, limpando seleção');
              localStorage.removeItem('selectedCompany');
              localStorage.removeItem('selectedCompanyId');
              localStorage.removeItem('selectedCompanyName');
              return null;
            }
          }
          return company;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting initial selected company:', error);
      return null;
    }
  }, [getCachedUserCompanies, getCurrentCacheVersion]);

  // Armazenar empresa selecionada no cache
  const cacheSelectedCompany = useCallback((company: Company | null) => {
    try {
      if (company) {
        const currentVersion = getCurrentCacheVersion();
        localStorage.setItem('selectedCompany', JSON.stringify(company));
        localStorage.setItem('selectedCompanyId', company.id);
        localStorage.setItem('selectedCompanyName', company.nome || '');
        localStorage.setItem('selectedCompanyVersion', currentVersion);
        console.log(`Company cached with version ${currentVersion}: ${company.nome}`);
      } else {
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompanyId');
        localStorage.removeItem('selectedCompanyName');
        localStorage.removeItem('selectedCompanyVersion');
      }
    } catch (error) {
      console.error('Error caching selected company:', error);
    }
  }, [getCurrentCacheVersion]);

  // Invalidar cache
  const invalidateCache = useCallback(() => {
    generateNewCacheVersion();
    console.log('Cache invalidated with new version');
  }, [generateNewCacheVersion]);

  return {
    getCachedUserCompanies,
    cacheUserCompanies,
    clearCachedUserCompanies,
    getInitialSelectedCompany,
    cacheSelectedCompany,
    invalidateCache,
    getCurrentCacheVersion
  };
};
