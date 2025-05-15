
import { useEffect, useRef, useCallback } from "react";
import { Company } from "@/types/company";

export const useCompanyEvents = (setSelectedCompany: (company: Company | null) => void) => {
  const previousCompanyRef = useRef<string | null>(null);
  const processingEventRef = useRef<boolean>(false);
  const lastEventTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleCompanySelected = useCallback((event: CustomEvent) => {
      const { company } = event.detail;
      
      // Prevent duplicate event processing for the same company
      if (previousCompanyRef.current === company?.id) {
        console.log(`Ignorando evento duplicado para empresa: ${company?.id}`);
        return;
      }
      
      // Throttle event handling to prevent cascading API calls
      const now = Date.now();
      if (now - lastEventTimeRef.current < 500 || processingEventRef.current) {
        console.log(`Throttling company selection events, skipping: ${company?.id}`);
        return;
      }
      
      lastEventTimeRef.current = now;
      processingEventRef.current = true;
      
      console.log(`Processando evento de seleção para empresa: ${company?.id}`);
      previousCompanyRef.current = company?.id || null;
      
      // Use setTimeout to further debounce the state update
      setTimeout(() => {
        setSelectedCompany(company);
        
        // Reset processing flag after a small delay
        setTimeout(() => {
          processingEventRef.current = false;
        }, 300);
      }, 50);
    }, [setSelectedCompany]);

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [setSelectedCompany]);
};
