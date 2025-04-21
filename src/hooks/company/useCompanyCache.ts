
import { useCallback } from 'react';
import { Company } from '@/types/company';

export const useCompanyCache = () => {
  // Get cached user companies
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

  // Cache user companies
  const cacheUserCompanies = useCallback((companies: Company[]) => {
    try {
      if (Array.isArray(companies) && companies.length > 0) {
        localStorage.setItem('userCompanies', JSON.stringify(companies));
      }
    } catch (error) {
      console.error('Error caching user companies:', error);
    }
  }, []);

  // Clear cached user companies
  const clearCachedUserCompanies = useCallback(() => {
    try {
      localStorage.removeItem('userCompanies');
    } catch (error) {
      console.error('Error clearing cached user companies:', error);
    }
  }, []);

  // Get initial selected company (from cache)
  const getInitialSelectedCompany = useCallback((): Company | null => {
    try {
      const cachedCompany = localStorage.getItem('selectedCompany');
      if (cachedCompany) {
        const company = JSON.parse(cachedCompany);
        if (company && company.id) {
          // Check if user has access to this company
          const cachedUserCompanies = getCachedUserCompanies();
          if (cachedUserCompanies) {
            const hasAccess = cachedUserCompanies.some(c => c.id === company.id);
            if (!hasAccess) {
              console.log('User does not have access to cached company, clearing selection');
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
