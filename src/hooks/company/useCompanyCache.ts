
import { useCallback } from 'react';
import { Company } from '@/types/company';

export const useCompanyCache = () => {
  // Chave de timestamp única para invalidação de cache
  const CACHE_VERSION_KEY = 'company_cache_version';
  const CACHE_INVALIDATION_LOCK = 'company_cache_invalidation_lock';
  
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
  
  // Verificar se o cache pode ser invalidado (prevenção de loop)
  const canInvalidateCache = useCallback(() => {
    const now = Date.now();
    const lastInvalidation = localStorage.getItem(CACHE_INVALIDATION_LOCK);
    
    if (!lastInvalidation) return true;
    
    // Prevenir invalidação em menos de 1 segundo (anti-loop)
    const cooldown = 1000; // 1 second cooldown
    if (now - parseInt(lastInvalidation) < cooldown) {
      console.log('Cache invalidation prevented (too frequent) - cooling down');
      return false;
    }
    
    return true;
  }, []);
  
  // Buscar empresas do usuário do cache
  const getCachedUserCompanies = useCallback((): Company[] | null => {
    try {
      const cachedData = localStorage.getItem('userCompanies');
      const cachedTimestamp = localStorage.getItem('userCompaniesTimestamp');
      const cachedVersion = localStorage.getItem('userCompaniesVersion');
      const currentVersion = getCurrentCacheVersion();
      
      if (!cachedData || !cachedTimestamp || cachedVersion !== currentVersion) return null;
      
      // Verificar se o cache não está expirado (5 minutos)
      const now = Date.now();
      const cacheTime = parseInt(cachedTimestamp);
      if (now - cacheTime > 5 * 60 * 1000) return null;
      
      if (cachedData) {
        const companies = JSON.parse(cachedData);
        if (Array.isArray(companies) && companies.length > 0) {
          console.log(`Using cached companies (version: ${cachedVersion})`);
          return companies;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached user companies:', error);
      return null;
    }
  }, [getCurrentCacheVersion]);

  // Armazenar empresas do usuário no cache
  const cacheUserCompanies = useCallback((companies: Company[]) => {
    try {
      if (Array.isArray(companies) && companies.length > 0) {
        const currentVersion = getCurrentCacheVersion();
        localStorage.setItem('userCompanies', JSON.stringify(companies));
        localStorage.setItem('userCompaniesTimestamp', Date.now().toString());
        localStorage.setItem('userCompaniesVersion', currentVersion);
        console.log(`Companies cached with version ${currentVersion}`);
      }
    } catch (error) {
      console.error('Error caching user companies:', error);
    }
  }, [getCurrentCacheVersion]);

  // Limpar cache de empresas do usuário
  const clearCachedUserCompanies = useCallback(() => {
    if (!canInvalidateCache()) return;
    
    try {
      localStorage.removeItem('userCompanies');
      localStorage.removeItem('userCompaniesTimestamp');
      localStorage.removeItem('userCompaniesUserId');
      localStorage.removeItem('userCompaniesVersion');
      localStorage.removeItem('selectedCompany');
      localStorage.removeItem('selectedCompanyId');
      localStorage.removeItem('selectedCompanyName');
      localStorage.removeItem('selectedCompanyVersion');
      // Gerar nova versão de cache para invalidar todos os caches relacionados
      generateNewCacheVersion();
      // Registrar momento da invalidação
      localStorage.setItem(CACHE_INVALIDATION_LOCK, Date.now().toString());
      console.log('All company cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cached user companies:', error);
    }
  }, [generateNewCacheVersion, canInvalidateCache]);

  // Obter empresa selecionada inicialmente (do cache)
  const getInitialSelectedCompany = useCallback((): Company | null => {
    try {
      const cachedCompany = localStorage.getItem('selectedCompany');
      const cachedVersion = localStorage.getItem('selectedCompanyVersion');
      const currentVersion = getCurrentCacheVersion();
      
      // Se a versão do cache não corresponder à versão atual, invalidar
      if (!cachedCompany || !cachedVersion || cachedVersion !== currentVersion) {
        console.log('Company cache version mismatch, invalidating cache');
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompanyId');
        localStorage.removeItem('selectedCompanyName');
        localStorage.removeItem('selectedCompanyVersion');
        return null;
      }
      
      if (cachedCompany) {
        const company = JSON.parse(cachedCompany);
        if (company && company.id) {
          console.log(`Using cached selected company: ${company.nome} (version: ${cachedVersion})`);
          return company;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting initial selected company:', error);
      return null;
    }
  }, [getCurrentCacheVersion]);

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
    if (!canInvalidateCache()) return;
    
    generateNewCacheVersion();
    localStorage.setItem(CACHE_INVALIDATION_LOCK, Date.now().toString());
    console.log('Cache invalidated with new version');
  }, [generateNewCacheVersion, canInvalidateCache]);

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
