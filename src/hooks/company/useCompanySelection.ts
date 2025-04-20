
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
      // Store full company object for better persistence across page loads
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      localStorage.setItem('selectedCompanyTimestamp', Date.now().toString());
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
      // Verify timestamp to ensure data isn't too old
      const timestamp = parseInt(localStorage.getItem('selectedCompanyTimestamp') || '0', 10);
      const now = Date.now();
      const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - timestamp > CACHE_DURATION) {
        console.log('Cached company data is too old, clearing...');
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompanyId');
        localStorage.removeItem('selectedCompanyTimestamp');
        return null;
      }
      
      return JSON.parse(storedCompany) as Company;
    } catch (e) {
      console.error('Error parsing stored company', e);
      return null;
    }
  }, []);

  /**
   * Select a company and update all necessary state
   */
  const selectCompany = useCallback((userId: string, company: Company) => {
    if (!company) {
      console.error('Attempt to select null company');
      return;
    }
    
    console.log(`Selecting company: ${company.nome} (${company.id})`);
    setSelectedCompany(company);
    
    // Store selection in local storage
    persistCompanySelection(company);
    
    // Trigger event for components listening for company changes
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
