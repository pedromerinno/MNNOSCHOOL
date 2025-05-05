
import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useCompanyDialogState } from "./useCompanyDialogState";
import { usePageLoadingState } from "./usePageLoadingState";
import { useCompanyCallbacks } from "./useCompanyCallbacks";
import { useOnboardingCheck } from "./useOnboardingCheck";
import { useInitialCompanyLoad } from "./useInitialCompanyLoad";
import { toast } from "sonner";

export const useCompanyInitialization = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { userCompanies, isLoading, fetchCount, selectedCompany, getUserCompanies, forceGetUserCompanies } = useCompanies();
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  
  // Get the cached company status
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // Use the separated hooks
  const { hasAttemptedForceLoad, hasRedirectedToOnboarding } = useOnboardingCheck(
    user, 
    userProfile, 
    isLoading, 
    userCompanies, 
    fetchCount, 
    forceGetUserCompanies,
    setShowDialog
  );
  
  const { showCompanyDialog, setShowCompanyDialog } = useCompanyDialogState(
    userCompanies, 
    isLoading, 
    fetchCount, 
    hasRedirectedToOnboarding
  );
  
  const { isPageLoading: pageLoading, setIsPageLoading: setPageLoading } = usePageLoadingState(
    hasCachedCompany,
    selectedCompany,
    isLoading,
    fetchCount,
    isPageLoading
  );
  
  const { handleCompanyCreated, handleCompanyTypeSelect } = useCompanyCallbacks(
    setShowCompanyDialog,
    forceGetUserCompanies,
    user
  );
  
  // Initialize the initial company load
  useInitialCompanyLoad(
    user,
    userCompanies,
    isLoading,
    hasAttemptedForceLoad,
    getUserCompanies
  );

  // We need to fix a circular dependency issue by creating this function here
  function setShowDialog(show: boolean) {
    setShowCompanyDialog(show);
  }

  return {
    isPageLoading: pageLoading,
    showCompanyDialog,
    setShowCompanyDialog,
    userCompanies,
    isLoading,
    user,
    handleCompanyCreated,
    handleCompanyTypeSelect,
    forceGetUserCompanies,
    hasCachedCompany
  };
};
