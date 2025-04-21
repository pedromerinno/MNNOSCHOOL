
import { useState, useEffect } from "react";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";

export const usePageLoading = (userCompanies: any[], isLoading: boolean, fetchCount: number) => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { getInitialSelectedCompany } = useCompanyCache();
  
  // Immediate cache check to avoid skeleton if we have data
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // Improve page loading state control
  useEffect(() => {
    if (hasCachedCompany) {
      console.log("[Index] Empresa encontrada em cache, acelerando transição");
      setIsPageLoading(false);
      return;
    }
    
    if (!isLoading && fetchCount > 0) {
      console.log("[Index] Dados carregados, verificando empresas:", {
        userCompaniesCount: userCompanies?.length || 0
      });
      setIsPageLoading(false);
    }
    
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizando loading por timeout de segurança");
        setIsPageLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchCount, isPageLoading, hasCachedCompany, userCompanies]);

  return {
    isPageLoading,
    setIsPageLoading,
  };
};
