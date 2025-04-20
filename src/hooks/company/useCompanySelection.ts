
import { useCallback } from 'react';
import { Company } from '@/types/company';

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  const selectCompany = useCallback(async (userId: string, company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompanyId', company.id);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    
    const event = new CustomEvent('company-selected', { 
      detail: { userId, company } 
    });
    window.dispatchEvent(event);
  }, [setSelectedCompany]);

  const getStoredCompanyId = useCallback((): string | null => {
    return localStorage.getItem('selectedCompanyId');
  }, []);

  const getStoredCompany = useCallback((): Company | null => {
    const storedCompany = localStorage.getItem('selectedCompany');
    if (!storedCompany) return null;
    
    try {
      return JSON.parse(storedCompany);
    } catch (e) {
      console.error('Error parsing stored company:', e);
      return null;
    }
  }, []);

  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany
  };
};
