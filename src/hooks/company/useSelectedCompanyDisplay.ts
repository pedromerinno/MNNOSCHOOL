
import { useEffect, useState } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/company';

/**
 * Hook to reliably display the selected company information and handle updates
 */
export const useSelectedCompanyDisplay = () => {
  const { selectedCompany, isLoading } = useCompanies();
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companyLoaded, setCompanyLoaded] = useState(false);

  // Initialize with selected company data
  useEffect(() => {
    if (selectedCompany && !isLoading) {
      console.log(`[useSelectedCompanyDisplay] Empresa selecionada atualizada: ${selectedCompany.nome}`);
      setCurrentCompany(selectedCompany);
      setCompanyLoaded(true);
    }
  }, [selectedCompany, isLoading]);

  // Listen for company update events
  useEffect(() => {
    const handleCompanyUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedCompany = customEvent.detail?.company;
      
      if (updatedCompany) {
        console.log(`[useSelectedCompanyDisplay] Evento de atualização recebido: ${updatedCompany.nome}`);
        setCurrentCompany(updatedCompany);
        setCompanyLoaded(true);
      }
    };
    
    window.addEventListener('company-updated', handleCompanyUpdate);
    window.addEventListener('company-selected', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate);
      window.removeEventListener('company-selected', handleCompanyUpdate);
    };
  }, []);

  return {
    company: currentCompany,
    companyLoaded,
    isLoading: isLoading && !companyLoaded
  };
};
