
import { useCallback } from "react";
import { Company } from "@/types/company";

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  const persistCompanySelection = useCallback((company: Company) => {
    try {
      // First update local storage with company info
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      
      console.log(`Company selection being persisted for ${company.nome} (${company.id})`);
      
      // Limpar quaisquer dados anteriores antes de mudar a empresa
      window.dispatchEvent(new Event('company-changing'));
      
      // Pequeno delay para garantir que a limpeza ocorra primeiro
      setTimeout(() => {
        // Dispatch primary event for general app updates
        window.dispatchEvent(new CustomEvent('company-selected', { 
          detail: { company } 
        }));
        
        // Dispatch specific content reload events - Aumentar o delay para garantir que o evento principal seja processado primeiro
        setTimeout(() => {
          // Dispatch specific content reload events
          window.dispatchEvent(new CustomEvent('reload-company-videos', {
            detail: { companyId: company.id }
          }));
          
          window.dispatchEvent(new CustomEvent('reload-company-documents', {
            detail: { companyId: company.id }
          }));
          
          window.dispatchEvent(new CustomEvent('reload-company-roles', {
            detail: { companyId: company.id }
          }));
          
          window.dispatchEvent(new CustomEvent('reload-company-courses', {
            detail: { companyId: company.id }
          }));
          
          console.log(`Content reload events dispatched for ${company.nome}`);
        }, 200); // Aumentamos de 100ms para 200ms
      }, 100);
    } catch (e) {
      console.error('Failed to persist company selection', e);
    }
  }, []);

  const getStoredCompanyId = useCallback((): string | null => {
    return localStorage.getItem('selectedCompanyId');
  }, []);

  const getStoredCompany = useCallback((): Company | null => {
    const storedCompany = localStorage.getItem('selectedCompany');
    if (!storedCompany) return null;
    
    try {
      return JSON.parse(storedCompany) as Company;
    } catch (e) {
      console.error('Error parsing stored company', e);
      return null;
    }
  }, []);
  
  const selectCompany = useCallback((userId: string, company: Company) => {
    if (!company) {
      console.error('Attempt to select null company');
      return;
    }
    
    console.log(`Selecting company: ${company.nome} (${company.id})`);
    
    // IMPORTANT: Always update state AND persist selection for every selection
    setSelectedCompany(company);
    persistCompanySelection(company);
  }, [setSelectedCompany, persistCompanySelection]);

  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany,
    persistCompanySelection
  };
};
