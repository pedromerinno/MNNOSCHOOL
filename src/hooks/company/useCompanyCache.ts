
import { useCallback } from 'react';
import { Company } from '@/types/company';

export const useCompanyCache = () => {
  // Buscar empresas do usuário do cache
  const getCachedUserCompanies = useCallback((): Company[] | null => {
    try {
      const cachedData = localStorage.getItem('userCompanies');
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
      }
    } catch (error) {
      console.error('Error caching user companies:', error);
    }
  }, []);

  // Limpar cache de empresas do usuário
  const clearCachedUserCompanies = useCallback(() => {
    try {
      localStorage.removeItem('userCompanies');
    } catch (error) {
      console.error('Error clearing cached user companies:', error);
    }
  }, []);

  // Obter empresa selecionada inicialmente (do cache)
  const getInitialSelectedCompany = useCallback((): Company | null => {
    try {
      const cachedCompany = localStorage.getItem('selectedCompany');
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
  }, [getCachedUserCompanies]);

  return {
    getCachedUserCompanies,
    cacheUserCompanies,
    clearCachedUserCompanies,
    getInitialSelectedCompany
  };
};
