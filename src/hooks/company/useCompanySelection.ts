
import { useCallback } from "react";
import { Company } from "@/types/company";
import { toast } from "sonner";

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
      
      // Broadcast company selection for other components
      window.dispatchEvent(new CustomEvent('company-selected', { 
        detail: { company } 
      }));
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
