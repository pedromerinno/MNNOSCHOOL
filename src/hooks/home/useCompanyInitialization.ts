
import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useCompanyDialogState } from "./useCompanyDialogState";
import { usePageLoadingState } from "./usePageLoadingState";
import { useCompanyCallbacks } from "./useCompanyCallbacks";
import { useOnboardingCheck } from "./useOnboardingCheck";
import { useInitialCompanyLoad } from "./useInitialCompanyLoad";
import { useProfileCompletionCheck } from "./useProfileCompletionCheck";
import { toast } from "sonner";

export const useCompanyInitialization = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { userCompanies, isLoading, fetchCount, selectedCompany, getUserCompanies, forceGetUserCompanies } = useCompanies();
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  
  // Get the cached company status
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // Use the profile completion check
  const {
    showProfileDialog,
    setShowProfileDialog,
    showCompanyDialog: profileShowCompanyDialog,
    setShowCompanyDialog: profileSetShowCompanyDialog,
    handleProfileComplete,
    handleCompanyComplete,
    companyDialogTriggeredByProfile
  } = useProfileCompletionCheck();

  // Use the company dialog state
  const { showCompanyDialog: companyDialogState, setShowCompanyDialog: setCompanyDialogState } = useCompanyDialogState(
    userCompanies, 
    isLoading, 
    fetchCount, 
    hasRedirectedToOnboarding
  );
  
  // We need to merge the state from both hooks
  const showCompanyDialog = profileShowCompanyDialog || companyDialogState;
  
  // Use the separated hooks
  const { hasAttemptedForceLoad, hasRedirectedToOnboarding } = useOnboardingCheck(
    user, 
    userProfile, 
    isLoading, 
    userCompanies, 
    fetchCount, 
    forceGetUserCompanies,
    setShowDialog,
    companyDialogTriggeredByProfile
  );
  
  const { isPageLoading: pageLoading, setIsPageLoading: setPageLoading } = usePageLoadingState(
    hasCachedCompany,
    selectedCompany,
    isLoading,
    fetchCount,
    isPageLoading
  );
  
  const { handleCompanyCreated, handleCompanyTypeSelect } = useCompanyCallbacks(
    setShowDialog,
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
  // This also ensures both dialog states are updated together
  function setShowDialog(show: boolean) {
    profileSetShowCompanyDialog(show);
    setCompanyDialogState(show);
  }

  return {
    isPageLoading: pageLoading,
    showCompanyDialog,
    setShowCompanyDialog: setShowDialog,
    showProfileDialog,
    setShowProfileDialog,
    userCompanies,
    isLoading,
    user,
    handleCompanyCreated,
    handleCompanyTypeSelect,
    handleProfileComplete,
    handleCompanyComplete,
    forceGetUserCompanies,
    hasCachedCompany
  };
};
