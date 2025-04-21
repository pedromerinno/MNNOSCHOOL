
import { useState, useEffect } from 'react';
import { Company } from '@/types/company';

export const useCompanyNameDisplay = (selectedCompany: Company | null) => {
  const [displayName, setDisplayName] = useState<string>("merinno");

  useEffect(() => {
    const cachedCompanyName = localStorage.getItem('selectedCompanyName');
    if (cachedCompanyName) {
      setDisplayName(cachedCompanyName);
    }
  }, []);

  useEffect(() => {
    if (selectedCompany?.nome) {
      console.log(`CompanySelector: Atualizando nome para "${selectedCompany.nome}"`);
      setDisplayName(selectedCompany.nome);
      localStorage.setItem('selectedCompanyName', selectedCompany.nome);
    }
  }, [selectedCompany]);

  return { displayName, setDisplayName };
};
