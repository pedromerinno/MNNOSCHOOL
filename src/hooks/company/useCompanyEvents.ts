
import { useEffect } from "react";
import { Company } from "@/types/company";

/**
 * Hook to listen for company selection events
 */
export const useCompanyEvents = (
  setSelectedCompany: (company: Company | null) => void
) => {
  useEffect(() => {
    /**
     * Event handler for company-selected events
     */
    const handleCompanySelected = (event: CustomEvent<{company: Company}>) => {
      const { company } = event.detail;
      if (company) {
        console.log('Company selected event received:', company.nome);
        setSelectedCompany(company);
      }
    };
    
    // Add event listener
    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [setSelectedCompany]);
};
