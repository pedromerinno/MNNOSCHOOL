
import { useState, useEffect } from 'react';
import { Company } from '@/types/company';

export const useCompanyNameDisplay = (selectedCompany: Company | null) => {
  const [displayName, setDisplayName] = useState<string>(() => {
    // Initialize with cached name if available
    const cachedName = localStorage.getItem('selectedCompanyName');
    return cachedName || "MNNO";
  });

  useEffect(() => {
    if (selectedCompany?.nome) {
      console.log(`CompanySelector: Atualizando nome para "${selectedCompany.nome}"`);
      setDisplayName(selectedCompany.nome);
      
      // Update all related storage items consistently
      localStorage.setItem('selectedCompanyName', selectedCompany.nome);
      localStorage.setItem('selectedCompanyId', selectedCompany.id);
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
      localStorage.setItem('companyDisplayName', selectedCompany.nome);
      
      // Force a timestamp update to indicate fresh data
      localStorage.setItem('companyDataTimestamp', Date.now().toString());
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('company-display-updated', { 
        detail: { company: selectedCompany } 
      }));

      // Ensure page reflects the latest company data by dispatching additional event
      window.dispatchEvent(new Event('company-data-refreshed'));
    } else {
      // If no company is selected, check for cached company name
      const cachedCompanyName = localStorage.getItem('selectedCompanyName');
      if (cachedCompanyName && cachedCompanyName !== displayName) {
        setDisplayName(cachedCompanyName);
      }
    }
  }, [selectedCompany, displayName]);

  // Method to force refresh the display name from localStorage
  const refreshDisplayName = () => {
    const cachedName = localStorage.getItem('selectedCompanyName');
    if (cachedName) {
      setDisplayName(cachedName);
    }
  };

  return { displayName, setDisplayName, refreshDisplayName };
};
