
import { Company } from "@/types/company";

export const useCompanyCache = () => {
  const cacheUserCompanies = (companies: Company[]) => {
    try {
      localStorage.setItem('userCompanies', JSON.stringify(companies));
    } catch (error) {
      console.error('[CompanyCache] Erro ao armazenar empresas em cache:', error);
    }
  };

  const getCachedUserCompanies = (): Company[] | null => {
    try {
      const cached = localStorage.getItem('userCompanies');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('[CompanyCache] Erro ao recuperar empresas do cache:', error);
      return null;
    }
  };

  const clearCachedUserCompanies = () => {
    try {
      localStorage.removeItem('userCompanies');
      localStorage.removeItem('selectedCompany');
      localStorage.removeItem('selectedCompanyId');
    } catch (error) {
      console.error('[CompanyCache] Erro ao limpar cache de empresas:', error);
    }
  };

  const getInitialSelectedCompany = (): Company | null => {
    try {
      const cachedCompany = localStorage.getItem('selectedCompany');
      return cachedCompany ? JSON.parse(cachedCompany) : null;
    } catch (error) {
      console.error('[CompanyCache] Erro ao recuperar empresa selecionada do cache:', error);
      return null;
    }
  };

  // Add the missing functions that are used in useSelectedCompanyManagement
  const getStoredCompany = (): Company | null => {
    try {
      const companyData = localStorage.getItem('selectedCompany');
      if (companyData) {
        return JSON.parse(companyData);
      }
      return null;
    } catch (error) {
      console.error('[CompanyCache] Erro ao recuperar empresa do localStorage:', error);
      return null;
    }
  };

  const getStoredCompanyId = (): string | null => {
    try {
      return localStorage.getItem('selectedCompanyId');
    } catch (error) {
      console.error('[CompanyCache] Erro ao recuperar ID da empresa do localStorage:', error);
      return null;
    }
  };

  return {
    cacheUserCompanies,
    getCachedUserCompanies,
    clearCachedUserCompanies,
    getInitialSelectedCompany,
    getStoredCompany,
    getStoredCompanyId
  };
};
