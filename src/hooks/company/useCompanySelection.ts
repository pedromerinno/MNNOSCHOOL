
import { useCallback } from 'react';
import { Company } from '@/types/company';

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  // Buscar ID da empresa armazenado
  const getStoredCompanyId = useCallback((): string | null => {
    try {
      return localStorage.getItem('selectedCompanyId');
    } catch (error) {
      console.error('Error getting stored company ID:', error);
      return null;
    }
  }, []);
  
  // Buscar empresa armazenada completa
  const getStoredCompany = useCallback((): Company | null => {
    try {
      const storedCompany = localStorage.getItem('selectedCompany');
      if (storedCompany) {
        return JSON.parse(storedCompany);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored company:', error);
      return null;
    }
  }, []);
  
  // Selecionar empresa
  const selectCompany = useCallback((userId: string, company: Company) => {
    setSelectedCompany(company);
    
    try {
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      
      // Dispatch custom event for other components to listen
      const event = new CustomEvent('company-selected', { 
        detail: { userId, company } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving selected company:', error);
    }
  }, [setSelectedCompany]);
  
  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany
  };
};
