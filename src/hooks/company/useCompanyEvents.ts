
import { useEffect } from "react";
import { Company } from "@/types/company";

export const useCompanyEvents = (
  setSelectedCompany: React.Dispatch<React.SetStateAction<Company | null>>
) => {
  /**
   * Set up a listener for company selection events
   */
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { company } = event.detail;
      if (company) {
        setSelectedCompany(company);
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [setSelectedCompany]);

  /**
   * Dispatch an event when a company is selected
   */
  const dispatchCompanySelected = (userId: string, company: Company) => {
    const navEvent = new CustomEvent('company-selected', { 
      detail: { userId, company } 
    });
    window.dispatchEvent(navEvent);
  };

  return { dispatchCompanySelected };
};
