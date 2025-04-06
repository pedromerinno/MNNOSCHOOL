
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
   */
  const selectCompany = (userId: string, company: Company) => {
    setSelectedCompany(company);
    
    // Dispatch event to notify other components
    const navEvent = new CustomEvent('company-selected', { 
      detail: { userId, company } 
    });
    window.dispatchEvent(navEvent);
    
    console.log('Company selected:', company.nome);
  };

  return {
    selectCompany
  };
};
