
import { useCallback, useMemo, useRef } from 'react';
import { Company } from '@/types/company';

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  // Cache para evitar múltiplas leituras do localStorage
  const cachedCompanyIdRef = useRef<string | null | undefined>(undefined);
  const cachedCompanyRef = useRef<Company | null | undefined>(undefined);
  
  // Buscar ID da empresa armazenado (com cache)
  const getStoredCompanyId = useCallback((): string | null => {
    // Se já temos cache, retornar imediatamente
    if (cachedCompanyIdRef.current !== undefined) {
      return cachedCompanyIdRef.current;
    }
    
    try {
      const storedId = localStorage.getItem('selectedCompanyId');
      cachedCompanyIdRef.current = storedId;
      return storedId;
    } catch (error) {
      console.error('Error getting stored company ID:', error);
      cachedCompanyIdRef.current = null;
      return null;
    }
  }, []);
  
  // Buscar empresa armazenada completa (com cache)
  const getStoredCompany = useCallback((): Company | null => {
    // Se já temos cache, retornar imediatamente
    if (cachedCompanyRef.current !== undefined) {
      return cachedCompanyRef.current;
    }
    
    try {
      const storedCompany = localStorage.getItem('selectedCompany');
      if (storedCompany) {
        const company = JSON.parse(storedCompany);
        cachedCompanyRef.current = company;
        return company;
      }
      cachedCompanyRef.current = null;
      return null;
    } catch (error) {
      console.error('Error getting stored company:', error);
      cachedCompanyRef.current = null;
      return null;
    }
  }, []);
  
  // Função para limpar cache (útil quando empresa é alterada)
  const clearCache = useCallback(() => {
    cachedCompanyIdRef.current = undefined;
    cachedCompanyRef.current = undefined;
  }, []);
  
  // Selecionar empresa com persistência global
  const selectCompany = useCallback((userId: string, company: Company) => {
    // Atualizar cache primeiro
    cachedCompanyIdRef.current = company.id;
    cachedCompanyRef.current = company;
    
    // Atualizar estado local PRIMEIRO
    setSelectedCompany(company);
    
    try {
      // Persistir no localStorage
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      
      // Dispatch evento global para outros componentes
      const globalEvent = new CustomEvent('company-selected', { 
        detail: { userId, company } 
      });
      window.dispatchEvent(globalEvent);
      
      // Evento específico para navegação
      const navEvent = new CustomEvent('company-navigation-change', { 
        detail: { company } 
      });
      window.dispatchEvent(navEvent);
      
      // Evento genérico para mudança
      const changeEvent = new CustomEvent('company-changed', { 
        detail: { company } 
      });
      window.dispatchEvent(changeEvent);
      
    } catch (error) {
      console.error('[useCompanySelection] Error saving selected company:', error);
      // Limpar cache em caso de erro
      clearCache();
    }
  }, [setSelectedCompany, clearCache]);
  
  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany,
    clearCache
  };
};
