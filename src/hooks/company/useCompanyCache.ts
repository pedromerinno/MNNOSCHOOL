
import { Company } from "@/types/company";
import { useCache } from "@/hooks/useCache";

// Aumento drástico do tempo de cache para 12 horas para sessões de um dia
const CACHE_EXPIRATION_MINUTES = 720; // 12 horas de cache

/**
 * Hook para caching de dados de empresas para reduzir chamadas à API
 */
export const useCompanyCache = () => {
  const { setCache, getCache, clearCache } = useCache();
  
  // Chaves de cache
  const USER_COMPANIES_KEY = 'userCompanies';
  const SELECTED_COMPANY_KEY = 'selectedCompany';
  
  /**
   * Verifica se o cache expirou
   */
  const isCacheExpired = (): boolean => {
    const companies = getCachedUserCompanies();
    return !companies;
  };
  
  /**
   * Obtém empresas do usuário do cache
   */
  const getCachedUserCompanies = (): Company[] | null => {
    return getCache<Company[]>({
      key: USER_COMPANIES_KEY,
      expirationMinutes: CACHE_EXPIRATION_MINUTES
    });
  };
  
  /**
   * Obtém empresa selecionada do cache
   */
  const getCachedSelectedCompany = (): Company | null => {
    return getCache<Company>({
      key: SELECTED_COMPANY_KEY,
      expirationMinutes: CACHE_EXPIRATION_MINUTES
    });
  };
  
  /**
   * Armazena empresas do usuário em cache
   */
  const cacheUserCompanies = (companies: Company[]): void => {
    if (!companies || companies.length === 0) {
      console.log("[Company Cache] Nenhuma empresa para armazenar em cache, pulando");
      return;
    }
    
    setCache({
      key: USER_COMPANIES_KEY,
      expirationMinutes: CACHE_EXPIRATION_MINUTES
    }, companies);
  };
  
  /**
   * Armazena empresa selecionada em cache
   */
  const cacheSelectedCompany = (company: Company): void => {
    if (!company) {
      console.log("[Company Cache] Nenhuma empresa para armazenar em cache, pulando");
      return;
    }
    
    setCache({
      key: SELECTED_COMPANY_KEY,
      expirationMinutes: CACHE_EXPIRATION_MINUTES
    }, company);
  };
  
  /**
   * Limpa cache de empresas do usuário
   */
  const clearCachedUserCompanies = (): void => {
    clearCache(USER_COMPANIES_KEY);
  };
  
  /**
   * Limpa cache da empresa selecionada
   */
  const clearCachedSelectedCompany = (): void => {
    clearCache(SELECTED_COMPANY_KEY);
  };
  
  /**
   * Limpa todos os caches de empresa
   */
  const clearAllCompanyCache = (): void => {
    clearCachedUserCompanies();
    clearCachedSelectedCompany();
  };
  
  /**
   * Remove uma empresa do cache
   */
  const removeCachedCompany = (companyId: string): void => {
    try {
      const companies = getCachedUserCompanies();
      if (!companies) return;
      
      const updatedCompanies = companies.filter(company => company.id !== companyId);
      cacheUserCompanies(updatedCompanies);
      
      // Se a empresa removida é a selecionada, limpa o cache da empresa selecionada
      const selectedCompany = getCachedSelectedCompany();
      if (selectedCompany && selectedCompany.id === companyId) {
        clearCachedSelectedCompany();
      }
      
      console.log(`[Company Cache] Empresa ${companyId} removida do cache`);
    } catch (e) {
      console.error("[Company Cache] Erro ao remover empresa do cache:", e);
    }
  };
  
  return {
    getCachedUserCompanies,
    getCachedSelectedCompany,
    cacheUserCompanies,
    cacheSelectedCompany,
    clearCachedUserCompanies,
    clearCachedSelectedCompany,
    clearAllCompanyCache,
    removeCachedCompany,
    isCacheExpired
  };
};
