
import { useCallback } from 'react';
import { Company } from '@/types/company';

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  // Buscar ID da empresa armazenado
  const getStoredCompanyId = useCallback((): string | null => {
    try {
      const storedId = localStorage.getItem('selectedCompanyId');
      console.log('[useCompanySelection] Getting stored company ID:', storedId);
      return storedId;
    } catch (error) {
      console.error('Error getting stored company ID:', error);
      return null;
    }
  }, []);
  
  // Buscar empresa armazenada completa
  const getStoredCompany = useCallback((): Company | null => {
    try {
      const storedCompany = localStorage.getItem('selectedCompany');
      console.log('[useCompanySelection] Getting stored company:', storedCompany ? 'found' : 'not found');
      if (storedCompany) {
        const company = JSON.parse(storedCompany);
        console.log('[useCompanySelection] Parsed stored company:', company.nome);
        return company;
      }
      return null;
    } catch (error) {
      console.error('Error getting stored company:', error);
      return null;
    }
  }, []);
  
  // Selecionar empresa com persistência global
  const selectCompany = useCallback((userId: string, company: Company) => {
    console.log('[useCompanySelection] ================');
    console.log('[useCompanySelection] SELECTING COMPANY:', company.nome);
    console.log('[useCompanySelection] User ID:', userId);
    console.log('[useCompanySelection] ================');
    
    // Atualizar estado local PRIMEIRO
    setSelectedCompany(company);
    
    try {
      // Persistir no localStorage
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      
      console.log('[useCompanySelection] ✅ Company persisted to localStorage');
      console.log('[useCompanySelection] Stored ID:', company.id);
      console.log('[useCompanySelection] Stored Name:', company.nome);
      
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
      
      console.log('[useCompanySelection] ✅ Events dispatched');
      
    } catch (error) {
      console.error('[useCompanySelection] ❌ Error saving selected company:', error);
    }
  }, [setSelectedCompany]);
  
  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany
  };
};
