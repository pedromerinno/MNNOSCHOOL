
import { useEffect, useState } from 'react';
import { Company } from '@/types/company';

// Implementação correta do hook sem argumentos
export const useCompanyEvents = () => {
  const [selectedCompanyFromEvent, setSelectedCompanyFromEvent] = useState<Company | null>(null);
  
  useEffect(() => {
    const handleCompanySelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      const selectedCompany = customEvent.detail?.company;
      
      if (selectedCompany) {
        setSelectedCompanyFromEvent(selectedCompany);
      }
    };
    
    window.addEventListener('company-selected', handleCompanySelected);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected);
    };
  }, []);
  
  return selectedCompanyFromEvent;
};
