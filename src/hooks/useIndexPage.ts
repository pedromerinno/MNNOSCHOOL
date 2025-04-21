
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { usePageLoading } from "./index/usePageLoading";
import { useCompanyForm } from "./index/useCompanyForm";
import { useOnboardingCheck } from "./index/useOnboardingCheck";

export const useIndexPage = () => {
  const { userCompanies, isLoading, fetchCount, forceGetUserCompanies } = useCompanies();
  const { user, userProfile } = useAuth();
  
  // Initialize sub-hooks
  const { isPageLoading } = usePageLoading(userCompanies, isLoading, fetchCount);
  const { showCompanyForm } = useCompanyForm(isPageLoading, userCompanies, fetchCount);
  useOnboardingCheck(user, userProfile);
  
  // Debug logging to track state
  useEffect(() => {
    console.log("[Index] Current state:", {
      isPageLoading,
      showCompanyForm,
      userCompaniesCount: userCompanies?.length || 0,
      isLoading,
      fetchCount,
    });
  }, [isPageLoading, showCompanyForm, userCompanies, isLoading, fetchCount]);
  
  // Force initial load once
  useEffect(() => {
    if (user?.id && !isLoading && fetchCount === 0) {
      console.log("[Index] Iniciando carregamento inicial forçado de empresas");
      forceGetUserCompanies(user.id).catch(err => {
        console.error("[Index] Erro no carregamento inicial forçado:", err);
      });
    }
  }, [user?.id, isLoading, fetchCount, forceGetUserCompanies]);

  return {
    isPageLoading,
    showCompanyForm,
    userCompanies,
    user,
  };
};
