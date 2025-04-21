
import { useCallback } from 'react';
import { Company } from '@/types/company';
import { toast } from 'sonner';

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  // Get stored company ID from localStorage
  const getStoredCompanyId = useCallback((): string | null => {
    try {
      return localStorage.getItem('selectedCompanyId');
    } catch (error) {
      console.error('Error getting stored company ID:', error);
      return null;
    }
  }, []);

  // Get stored company object from localStorage
  const getStoredCompany = useCallback((): Company | null => {
    try {
      const companyData = localStorage.getItem('selectedCompany');
      if (companyData) {
        return JSON.parse(companyData);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored company:', error);
      return null;
    }
  }, []);

  // Select a company and store it in localStorage
  const selectCompany = useCallback((userId: string, company: Company | null) => {
    try {
      if (company) {
        localStorage.setItem('selectedCompanyId', company.id);
        localStorage.setItem('selectedCompany', JSON.stringify(company));
        setSelectedCompany(company);
        
        // Dispatch custom event for other components to react
        window.dispatchEvent(new CustomEvent('company-selected', { 
          detail: { company }
        }));
      } else {
        localStorage.removeItem('selectedCompanyId');
        localStorage.removeItem('selectedCompany');
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error('Error selecting company:', error);
      toast.error('Error selecting company. Please try again.');
    }
  }, [setSelectedCompany]);

  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany
  };
};
