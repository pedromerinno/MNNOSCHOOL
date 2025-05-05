
import { useCallback } from 'react';
import { Company } from '@/types/company';
import { cacheService } from '@/services/CacheService';

// Constantes para chaves de cache
const CACHE_NAMESPACE = 'company';
const USER_COMPANIES_KEY = 'userCompanies';
const SELECTED_COMPANY_KEY = 'selectedCompany';
const SELECTED_COMPANY_ID_KEY = 'selectedCompanyId';

export const useCompanyCache = () => {
  // Buscar empresas do usuário do cache
  const getCachedUserCompanies = useCallback((): Company[] | null => {
    try {
      return cacheService.get<Company[]>({
        namespace: CACHE_NAMESPACE,
        key: USER_COMPANIES_KEY,
        expirationMinutes: 60 // 1 hora
      });
    } catch (error) {
      console.error('Error getting cached user companies:', error);
      return null;
    }
  }, []);

  // Armazenar empresas do usuário no cache
  const cacheUserCompanies = useCallback((companies: Company[]) => {
    try {
      if (Array.isArray(companies) && companies.length > 0) {
        cacheService.set({
          namespace: CACHE_NAMESPACE,
          key: USER_COMPANIES_KEY
        }, companies);
      }
    } catch (error) {
      console.error('Error caching user companies:', error);
    }
  }, []);

  // Limpar cache de empresas do usuário
  const clearCachedUserCompanies = useCallback(() => {
    try {
      cacheService.clear({
        namespace: CACHE_NAMESPACE,
        key: USER_COMPANIES_KEY
      });
    } catch (error) {
      console.error('Error clearing cached user companies:', error);
    }
  }, []);

  // Obter empresa selecionada inicialmente (do cache)
  const getInitialSelectedCompany = useCallback((): Company | null => {
    try {
      const company = cacheService.get<Company>({
        namespace: CACHE_NAMESPACE,
        key: SELECTED_COMPANY_KEY
      });
      
      if (company && company.id) {
        // Verificar se o usuário tem acesso a esta empresa
        const cachedUserCompanies = getCachedUserCompanies();
        if (cachedUserCompanies) {
          const hasAccess = cachedUserCompanies.some(c => c.id === company.id);
          if (!hasAccess) {
            console.log('Usuário não tem acesso à empresa em cache, limpando seleção');
            cacheService.clear({ namespace: CACHE_NAMESPACE, key: SELECTED_COMPANY_KEY });
            cacheService.clear({ namespace: CACHE_NAMESPACE, key: SELECTED_COMPANY_ID_KEY });
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
  }, [getCachedUserCompanies]);

  // Método para armazenar a empresa selecionada
  const cacheSelectedCompany = useCallback((company: Company) => {
    try {
      cacheService.set({
        namespace: CACHE_NAMESPACE,
        key: SELECTED_COMPANY_KEY
      }, company);
      
      cacheService.set({
        namespace: CACHE_NAMESPACE,
        key: SELECTED_COMPANY_ID_KEY
      }, company.id);
    } catch (error) {
      console.error('Error caching selected company:', error);
    }
  }, []);

  // Método para obter o ID da empresa selecionada
  const getCachedCompanyId = useCallback((): string | null => {
    try {
      return cacheService.get<string>({
        namespace: CACHE_NAMESPACE,
        key: SELECTED_COMPANY_ID_KEY
      });
    } catch (error) {
      console.error('Error getting cached company ID:', error);
      return null;
    }
  }, []);

  return {
    getCachedUserCompanies,
    cacheUserCompanies,
    clearCachedUserCompanies,
    getInitialSelectedCompany,
    cacheSelectedCompany,
    getCachedCompanyId
  };
};
