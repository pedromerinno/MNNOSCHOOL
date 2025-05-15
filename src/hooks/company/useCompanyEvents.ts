
import { useEffect, useState } from 'react';
import { Company } from '@/types/company';

export const useCompanyEvents = () => {
  const [selectedCompanyFromEvent, setSelectedCompanyFromEvent] = useState<Company | null>(null);
  
  useEffect(() => {
    const handleCompanySelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("Company selected event received:", customEvent.detail);
      const selectedCompany = customEvent.detail?.company;
      
      if (selectedCompany) {
        console.log("Setting selected company from event:", selectedCompany.nome);
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
