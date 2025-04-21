
import { useEffect } from "react";
import { Company } from "@/types/company";

export const useCompanyEvents = (setSelectedCompany: (company: Company | null) => void) => {
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { company } = event.detail;
      setSelectedCompany(company);
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [setSelectedCompany]);
};
