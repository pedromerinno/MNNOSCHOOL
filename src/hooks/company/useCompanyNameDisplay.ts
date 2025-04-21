
import { useState, useEffect } from 'react';
import { Company } from '@/types/company';

export const useCompanyNameDisplay = (selectedCompany: Company | null) => {
  const [displayName, setDisplayName] = useState<string>("merinno");

  // Initialize from localStorage on mount
  useEffect(() => {
    const cachedCompanyName = localStorage.getItem('selectedCompanyName');
    if (cachedCompanyName) {
      setDisplayName(cachedCompanyName);
    }
  }, []);

  // Update when company changes
  useEffect(() => {
    if (selectedCompany?.nome) {
      console.log(`CompanyNameDisplay: Updating company name to "${selectedCompany.nome}"`);
      setDisplayName(selectedCompany.nome);
      localStorage.setItem('selectedCompanyName', selectedCompany.nome);
    }
  }, [selectedCompany]);

  // Add listener for company-updated events
  useEffect(() => {
    const handleCompanyUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedCompany = customEvent.detail?.company;
      if (updatedCompany?.nome) {
        console.log(`CompanyNameDisplay: Company updated event received for "${updatedCompany.nome}"`);
        setDisplayName(updatedCompany.nome);
        localStorage.setItem('selectedCompanyName', updatedCompany.nome);
      }
    };

    window.addEventListener('company-updated', handleCompanyUpdate);
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate);
    };
  }, []);

  return { displayName, setDisplayName };
};
