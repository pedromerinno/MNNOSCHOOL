
import { useState, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useCompanyCallbacks } from "./useCompanyCallbacks";
import { useProfileCompletionCheck } from "./useProfileCompletionCheck";

export const useCompanyInitialization = () => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  
  const { 
    userCompanies, 
    isLoading, 
    selectedCompany, 
    getUserCompanies, 
    forceGetUserCompanies 
  } = useCompanies({ skipLoadingInOnboarding: true });
  
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  
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

  // ABSOLUTE CRITICAL CHECK: Never show company dialog if user has companies
  const hasUserCompanies = userCompanies.length > 0;
  const shouldShowCompanyDialog = profileShowCompanyDialog && !hasUserCompanies;
  
  console.log("[useCompanyInitialization] CRITICAL DECISION POINT:", {
    userCompaniesLength: userCompanies.length,
    hasUserCompanies,
    profileShowCompanyDialog,
    shouldShowCompanyDialog,
    showProfileDialog,
    userEmail: user?.email,
    isSuperAdmin: userProfile?.super_admin
  });

  // If user has companies, always return false for company dialog
  const showCompanyDialog = hasUserCompanies ? false : shouldShowCompanyDialog;
  
  function setShowDialog(show: boolean) {
    // CRITICAL SAFETY: Never allow opening dialog if user has companies
    if (show && hasUserCompanies) {
      console.log("[useCompanyInitialization] BLOCKED: Cannot open dialog - user has companies");
      return;
    }
    
    console.log("[useCompanyInitialization] Setting company dialog:", show);
    profileSetShowCompanyDialog(show);
    
    if (show) {
      hasShownCompanyDialogRef.current = true;
    }
  }
  
  const { handleCompanyCreated, handleCompanyTypeSelect } = useCompanyCallbacks(
    setShowDialog,
    forceGetUserCompanies,
    user
  );

  return {
    isPageLoading: false,
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
