
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

  // CRITICAL: Override company dialog to false if user has companies
  const showCompanyDialog = userCompanies.length > 0 ? false : profileShowCompanyDialog;
  
  console.log("[useCompanyInitialization] State check", {
    userCompaniesLength: userCompanies.length,
    profileShowCompanyDialog,
    finalShowCompanyDialog: showCompanyDialog,
    showProfileDialog,
    userEmail: user?.email,
    isSuperAdmin: userProfile?.super_admin
  });
  
  function setShowDialog(show: boolean) {
    // Additional safety check - don't allow opening if user has companies
    if (show && userCompanies.length > 0) {
      console.log("[useCompanyInitialization] Preventing dialog open - user has companies");
      return;
    }
    
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
