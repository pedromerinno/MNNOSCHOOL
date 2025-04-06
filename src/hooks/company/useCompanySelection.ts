
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
    if (!userId || !company) {
      console.warn("selectCompany called with invalid parameters", { userId, company });
      return;
    }
    
    console.log('Setting selected company:', company.nome);
    
    // Ensure we're storing the complete company object
    setSelectedCompany(company);
    
    // Store selected company in local storage for persistence
    try {
      localStorage.setItem('selectedCompanyId', company.id);
    } catch (error) {
      console.error("Failed to save company selection to localStorage", error);
    }
    
    // Dispatch event to notify other components
    try {
      const navEvent = new CustomEvent('company-selected', { 
        detail: { userId, company } 
      });
      window.dispatchEvent(navEvent);
      
      console.log('Company selected:', company.nome, 'Phrase:', company.frase_institucional);
    } catch (error) {
      console.error("Error dispatching company-selected event", error);
    }
  };

  /**
   * Retrieves a previously selected company ID from local storage
   */
  const getStoredCompanyId = (): string | null => {
    try {
      return localStorage.getItem('selectedCompanyId');
    } catch (error) {
      console.error("Failed to read selectedCompanyId from localStorage", error);
      return null;
    }
  };

  return {
    selectCompany,
    getStoredCompanyId
  };
};
