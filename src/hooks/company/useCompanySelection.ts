
import { Dispatch, SetStateAction } from "react";
import { Company } from "@/types/company";
import { toast } from "sonner";

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
    console.log('Selecting company:', company.nome);
    if (!company.id) {
      console.error('Cannot select company without ID');
      toast.error('Erro ao selecionar empresa', {
        description: 'Esta empresa não possui um ID válido'
      });
      return;
    }
    
    // Ensure we're storing the complete company object
    setSelectedCompany(company);
    
    // Store selected company in local storage for persistence
    localStorage.setItem('selectedCompanyId', company.id);
    
    // Dispatch event to notify other components
    try {
      const navEvent = new CustomEvent('company-selected', { 
        detail: { userId, company } 
      });
      window.dispatchEvent(navEvent);
      
      console.log('Company selected:', company.nome, 'Phrase:', company.frase_institucional);
    } catch (error) {
      console.error('Error dispatching company selection event:', error);
    }
  };

  /**
   * Retrieves a previously selected company ID from local storage
   */
  const getStoredCompanyId = (): string | null => {
    try {
      return localStorage.getItem('selectedCompanyId');
    } catch (error) {
      console.error('Error reading selectedCompanyId from localStorage:', error);
      return null;
    }
  };

  return {
    selectCompany,
    getStoredCompanyId
  };
};
