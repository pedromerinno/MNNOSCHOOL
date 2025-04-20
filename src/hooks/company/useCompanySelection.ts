
import { useCallback } from "react";
import { Company } from "@/types/company";

interface UseCompanySelectionProps {
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanySelection = ({ setSelectedCompany }: UseCompanySelectionProps) => {
  /**
   * Store the selected company in local storage for persistence
   */
  const persistCompanySelection = useCallback((company: Company) => {
    try {
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      
      // We remove this dispatch since it will be done in selectCompany
    } catch (e) {
      console.error('Failed to persist company selection', e);
    }
  }, []);

  /**
   * Retrieve the stored company ID from local storage
   */
  const getStoredCompanyId = useCallback((): string | null => {
    return localStorage.getItem('selectedCompanyId');
  }, []);

  /**
   * Retrieve the stored company object from local storage
   */
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

  /**
   * Select a company and update all necessary state
   * We use a debounce flag to prevent duplicate events
   */
  let lastSelectedCompanyId: string | null = null;
  
  const selectCompany = useCallback((userId: string, company: Company) => {
    if (!company) {
      console.error('Attempt to select null company');
      return;
    }
    
    // Skip if the company has already been selected
    if (lastSelectedCompanyId === company.id) {
      console.log(`Company ${company.nome} already selected, skipping event`);
      return;
    }
    
    // Update the last selected company to prevent duplicate selections
    lastSelectedCompanyId = company.id;
    
    console.log(`Selecting company: ${company.nome} (${company.id})`);
    setSelectedCompany(company);
    
    // Store selection in local storage
    persistCompanySelection(company);
    
    // Trigger event for components listening for company changes
    // But only do it once per company selection
    const navEvent = new CustomEvent('company-selected', { 
      detail: { userId, company } 
    });
    window.dispatchEvent(navEvent);
  }, [setSelectedCompany, persistCompanySelection]);

  return {
    selectCompany,
    getStoredCompanyId,
    getStoredCompany
  };
};
