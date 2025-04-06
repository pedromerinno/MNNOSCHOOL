
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
    if (!company) {
      console.warn('Attempted to select empty company data');
      return;
    }
    
    console.log('Setting selected company:', company);
    
    // Check if company has all required properties
    if (!company.id || !company.nome) {
      console.error('Company is missing required properties', company);
      return;
    }
    
    console.log('Frase institucional da empresa:', company.frase_institucional);
    
    // Ensure we're storing the complete company object
    setSelectedCompany(company);
    
    // Store selected company in local storage for persistence
    localStorage.setItem('selectedCompanyId', company.id);
    
    // Also cache the full company for offline availability
    try {
      localStorage.setItem('selectedCompany', JSON.stringify(company));
    } catch (e) {
      console.error('Failed to cache selected company', e);
    }
    
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
  
  /**
   * Retrieves the full previously selected company from local storage
   */
  const getStoredCompany = (): Company | null => {
    const storedCompany = localStorage.getItem('selectedCompany');
    if (!storedCompany) return null;
    
    try {
      return JSON.parse(storedCompany) as Company;
    } catch (e) {
      console.error('Failed to parse stored company', e);
      return null;
    }
  };

  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany
  };
};
