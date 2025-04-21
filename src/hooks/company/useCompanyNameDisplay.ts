
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
      localStorage.setItem('selectedCompanyName', selectedCompany.nome);
      localStorage.setItem('selectedCompanyId', selectedCompany.id);
    } else {
      // If no company is selected, check for cached company name
      const cachedCompanyName = localStorage.getItem('selectedCompanyName');
      if (cachedCompanyName && cachedCompanyName !== displayName) {
        setDisplayName(cachedCompanyName);
      }
    }
  }, [selectedCompany, displayName]);

  return { displayName, setDisplayName };
};
