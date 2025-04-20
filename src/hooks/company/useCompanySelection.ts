
import { useCallback } from "react";
import { Company } from "@/types/company";

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

// Cache expiration time in ms (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  /**
   * Check if the company cache is valid
   */
  const isCacheValid = useCallback((): boolean => {
    const cachedTimestamp = localStorage.getItem('selectedCompanyTimestamp');
    if (!cachedTimestamp) return false;
    
    try {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      return (now - timestamp) < CACHE_EXPIRATION;
    } catch (e) {
      return false;
    }
  }, []);

  /**
   * Store the selected company in local storage for persistence
   * Armazena tanto no localStorage quanto em um Cache otimizado
   */
  const persistCompanySelection = useCallback((company: Company) => {
    try {
      if (!company || !company.id) {
        console.error('Attempted to persist invalid company', company);
        return;
      }
      
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      localStorage.setItem('selectedCompanyTimestamp', Date.now().toString());
      
      // Armazenar também no cache local storage usando o formato do hook useCache
      try {
        const cacheData = {
          data: company,
          timestamp: Date.now()
        };
        localStorage.setItem('selectedCompany', JSON.stringify(cacheData));
      } catch (e) {
        console.error('Erro ao armazenar no cache formatado:', e);
      }
      
      console.log(`Company persisted: ${company.nome} (${company.id})`);
    } catch (e) {
      console.error('Failed to persist company selection', e);
    }
  }, []);

  /**
   * Retrieve the stored company ID from local storage
   */
  const getStoredCompanyId = useCallback((): string | null => {
    return localStorage.getItem('selectedCompanyId');
  }, []);

  /**
   * Retrieve the stored company object from local storage
   * Only returns the company if the cache is still valid
   */
  const getStoredCompany = useCallback((): Company | null => {
    try {
      // Primeiro tentar o formato de cache
      const storedCompany = localStorage.getItem('selectedCompany');
      if (!storedCompany) return null;
      
      // Tentar primeiro o formato do useCache
      try {
        const parsed = JSON.parse(storedCompany);
        if (parsed.data && parsed.timestamp) {
          const { data, timestamp } = parsed;
          
          // Verificar se o cache ainda é válido
          const now = Date.now();
          if ((now - timestamp) < CACHE_EXPIRATION) {
            return data as Company;
          }
        }
      } catch (e) {
        console.log('Formato de cache não encontrado, tentando formato antigo');
      }
      
      // Formato antigo / fallback
      if (!isCacheValid()) {
        console.log('Company cache expired, will reload from server');
        return null;
      }
      
      const company = JSON.parse(storedCompany) as Company;
      
      // Validate the company has required fields
      if (!company.id || !company.nome) {
        console.error('Invalid company data in cache, missing required fields');
        return null;
      }
      
      return company;
    } catch (e) {
      console.error('Error parsing stored company', e);
      return null;
    }
  }, [isCacheValid]);

  /**
   * Select a company and update all necessary state
   * We use a debounce flag to prevent duplicate events
   */
  let lastSelectedCompanyId: string | null = null;
  
  const selectCompany = useCallback((userId: string, company: Company) => {
    if (!company) {
      console.error('Attempt to select null company');
      return;
    }
    
    // Skip if the company has already been selected
    if (lastSelectedCompanyId === company.id) {
      console.log(`Company ${company.nome} already selected, skipping event`);
      return;
    }
    
    // Update the last selected company to prevent duplicate selections
    lastSelectedCompanyId = company.id;
    
    console.log(`Selecting company: ${company.nome} (${company.id})`);
    setSelectedCompany(company);
    
    // Store selection in local storage
    persistCompanySelection(company);
    
    // Trigger event for components listening for company changes
    // But only do it once per company selection
    const navEvent = new CustomEvent('company-selected', { 
      detail: { userId, company } 
    });
    window.dispatchEvent(navEvent);
  }, [setSelectedCompany, persistCompanySelection]);

  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany,
    persistCompanySelection
  };
};
