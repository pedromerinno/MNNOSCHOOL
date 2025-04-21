
import { useState, useEffect } from "react";

export const useCompanyForm = (
  isPageLoading: boolean,
  userCompanies: any[],
  fetchCount: number
) => {
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [formShowDelayComplete, setFormShowDelayComplete] = useState(false);
  
  // Implement delay to show form after determining no companies exist
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (!isPageLoading && userCompanies.length === 0 && fetchCount > 0) {
      console.log("[Index] Iniciando delay de 500ms para mostrar formulário de empresa");
      timeoutId = window.setTimeout(() => {
        console.log("[Index] Delay completo, habilitando exibição do formulário");
        setFormShowDelayComplete(true);
      }, 500);
    } else {
      setFormShowDelayComplete(false);
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isPageLoading, userCompanies.length, fetchCount]);
  
  // Update showCompanyForm whenever formShowDelayComplete changes
  useEffect(() => {
    if (!isPageLoading && userCompanies.length === 0 && formShowDelayComplete) {
      console.log("[Index] Exibindo formulário após verificação completa e delay");
      setShowCompanyForm(true);
    } else if (userCompanies.length > 0) {
      console.log("[Index] Usuário tem empresas, ocultando formulário");
      setShowCompanyForm(false);
    }
  }, [formShowDelayComplete, isPageLoading, userCompanies.length]);

  return {
    showCompanyForm,
    setShowCompanyForm,
  };
};
