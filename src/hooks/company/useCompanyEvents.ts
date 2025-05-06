
import { useEffect, useRef } from "react";
import { Company } from "@/types/company";

export const useCompanyEvents = (setSelectedCompany: (company: Company | null) => void) => {
  const previousCompanyRef = useRef<string | null>(null);

  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { company } = event.detail;
      
      // Prevenir processamento duplicado do mesmo evento para a mesma empresa
      if (previousCompanyRef.current === company?.id) {
        console.log(`Ignorando evento duplicado para empresa: ${company?.id}`);
        return;
      }
      
      console.log(`Processando evento de seleção para empresa: ${company?.id}`);
      previousCompanyRef.current = company?.id || null;
      setSelectedCompany(company);
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [setSelectedCompany]);
};
