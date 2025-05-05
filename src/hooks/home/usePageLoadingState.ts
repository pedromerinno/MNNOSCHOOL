
import { useState, useEffect } from "react";

export const usePageLoadingState = (
  hasCachedCompany: boolean,
  selectedCompany: any | null,
  isLoading: boolean,
  fetchCount: number,
  isPageLoading: boolean
) => {
  const [pageLoading, setPageLoading] = useState(true);
  
  // Handle page loading state
  useEffect(() => {
    if (hasCachedCompany) {
      setTimeout(() => setPageLoading(false), 50);
      return;
    }
    
    if (selectedCompany || (fetchCount > 0 && !isLoading)) {
      setPageLoading(false);
    }
    
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizando loading por timeout de segurança");
        setPageLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchCount, selectedCompany, isPageLoading, hasCachedCompany]);

  return {
    isPageLoading: pageLoading,
    setIsPageLoading: setPageLoading
  };
};
