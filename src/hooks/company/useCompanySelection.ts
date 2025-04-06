
import { Dispatch, SetStateAction } from "react";
import { Company } from "@/types/company";

interface UseCompanySelectionProps {
  setSelectedCompany: Dispatch<SetStateAction<Company | null>>;
}

export const useCompanySelection = ({
  setSelectedCompany
}: UseCompanySelectionProps) => {
  /**
   * Selects a company for the current user session (UI only, no database changes)
   * Also broadcasts a custom event so other components can react to the selection
   */
  const selectCompany = (userId: string, company: Company) => {
    console.log('Setting selected company:', company);
    setSelectedCompany(company);
    
    // Store selected company in local storage for persistence
    localStorage.setItem('selectedCompanyId', company.id);
    
    // Dispatch event to notify other components
    const navEvent = new CustomEvent('company-selected', { 
      detail: { userId, company } 
    });
    window.dispatchEvent(navEvent);
    
    console.log('Company selected:', company.nome, 'Phrase:', company.frase_institucional);
  };

  /**
   * Retrieves a previously selected company ID from local storage
   */
  const getStoredCompanyId = (): string | null => {
    return localStorage.getItem('selectedCompanyId');
  };

  return {
    selectCompany,
    getStoredCompanyId
  };
};
