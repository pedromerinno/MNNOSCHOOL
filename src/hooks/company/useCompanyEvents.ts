
import { Dispatch, SetStateAction, useEffect } from "react";
import { Company } from "@/types/company";

/**
 * Hook that listens for global company events and updates the selected company
 */
export const useCompanyEvents = (
  setSelectedCompany: Dispatch<SetStateAction<Company | null>>
) => {
  useEffect(() => {
    const handleCompanySelection = (e: CustomEvent<{ userId: string; company: Company }>) => {
      console.log('Company selection event received', e.detail.company.nome);
      setSelectedCompany(e.detail.company);
    };

    window.addEventListener('company-selected', handleCompanySelection as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelection as EventListener);
    };
  }, [setSelectedCompany]);
};
