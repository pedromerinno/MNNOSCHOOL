
import { useEffect } from 'react';
import { Company } from '@/types/company';

// Fix hook implementation to match expected signature with no arguments
export const useCompanyEvents = (setSelectedCompany: (company: Company | null) => void) => {
  useEffect(() => {
    const handleCompanySelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      const selectedCompany = customEvent.detail?.company;
      
      if (selectedCompany) {
        setSelectedCompany(selectedCompany);
      }
    };
    
    window.addEventListener('company-selected', handleCompanySelected);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected);
    };
  }, [setSelectedCompany]);
};
