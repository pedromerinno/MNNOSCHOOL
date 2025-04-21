
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useNavigate } from "react-router-dom";

export const useIndexPage = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [formShowDelayComplete, setFormShowDelayComplete] = useState(false);
  const { userCompanies, isLoading, fetchCount, forceGetUserCompanies } = useCompanies();
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  const navigate = useNavigate();
  
  // Debug logging to track state
  useEffect(() => {
    console.log("[Index] Current state:", {
      isPageLoading,
      showCompanyForm,
      formShowDelayComplete,
      userCompaniesCount: userCompanies?.length || 0,
      isLoading,
      fetchCount,
    });
  }, [isPageLoading, showCompanyForm, formShowDelayComplete, userCompanies, isLoading, fetchCount]);
  
  // Check if onboarding is needed
  useEffect(() => {
    if (!user) return;
    
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[Index] Usuário precisa completar onboarding, redirecionando...");
      navigate("/onboarding", { replace: true });
      return;
    }
  }, [user, userProfile, navigate]);

  // Immediate cache check to avoid skeleton if we have data
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // Force initial load once
  useEffect(() => {
    if (user?.id && !isLoading && fetchCount === 0) {
      console.log("[Index] Iniciando carregamento inicial forçado de empresas");
      forceGetUserCompanies(user.id).catch(err => {
        console.error("[Index] Erro no carregamento inicial forçado:", err);
      });
    }
  }, [user?.id, isLoading, fetchCount, forceGetUserCompanies]);
  
  // Implement 500ms delay to show form after determining no companies exist
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
  
  // Improve page loading state control and determine when to show form
  useEffect(() => {
    if (hasCachedCompany) {
      console.log("[Index] Empresa encontrada em cache, acelerando transição");
      setIsPageLoading(false);
      setShowCompanyForm(false);
      return;
    }
    
    if (!isLoading && fetchCount > 0) {
      console.log("[Index] Dados carregados, verificando empresas:", {
        userCompaniesCount: userCompanies?.length || 0
      });
      
      setIsPageLoading(false);
      setShowCompanyForm(userCompanies.length === 0 && formShowDelayComplete);
    }
    
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizando loading por timeout de segurança");
        setIsPageLoading(false);
        
        if (fetchCount > 0 && formShowDelayComplete) {
          setShowCompanyForm(userCompanies.length === 0);
        }
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchCount, isPageLoading, hasCachedCompany, userCompanies, formShowDelayComplete]);

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
    isPageLoading,
    showCompanyForm,
    userCompanies,
    user,
  };
};
