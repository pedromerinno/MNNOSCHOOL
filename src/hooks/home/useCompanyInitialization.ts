
import { useState, useRef } from "react";
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
  
  // Create a ref to handle the circular dependency
  const companyDialogTriggeredByProfileRef = useRef(false);
  
  // Get the cached company status
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // Create a ref to prevent multiple company dialog openings
  const hasShownCompanyDialogRef = useRef(false);
  
  // Use the profile completion check first
  const {
    showProfileDialog,
    setShowProfileDialog,
    showCompanyDialog: profileShowCompanyDialog,
    setShowCompanyDialog: profileSetShowCompanyDialog,
    handleProfileComplete,
    handleCompanyComplete,
    companyDialogTriggeredByProfile
  } = useProfileCompletionCheck();

  // We need to fix a circular dependency issue by creating this function here
  // This also ensures both dialog states are updated together
  function setShowDialog(show: boolean) {
    profileSetShowCompanyDialog(show);
    setCompanyDialogState(show);
    
    // If we're showing the dialog, mark it as shown
    if (show) {
      hasShownCompanyDialogRef.current = true;
    }
  }

  // Now we can use onboarding check with the right dependencies
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
  
  // Use the company dialog state with the onboarding ref
  const { showCompanyDialog: companyDialogState, setShowCompanyDialog: setCompanyDialogState } = useCompanyDialogState(
    userCompanies, 
    isLoading, 
    fetchCount, 
    hasRedirectedToOnboarding
  );
  
  // We need to merge the state from both hooks
  const showCompanyDialog = profileShowCompanyDialog || companyDialogState;
  
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
    hasCachedCompany,
    hasShownCompanyDialog: hasShownCompanyDialogRef
  };
};
