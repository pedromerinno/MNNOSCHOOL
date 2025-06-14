
import { useState, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useCompanyCallbacks } from "./useCompanyCallbacks";

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
  
  // Simplified dialog states - NO automatic dialogs
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);

  console.log("[useCompanyInitialization] State check", {
    userCompaniesLength: userCompanies.length,
    showCompanyDialog,
    showProfileDialog,
    userEmail: user?.email,
    isSuperAdmin: userProfile?.super_admin,
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    isLoading,
    hasCachedCompany
  });
  
  const handleProfileComplete = () => {
    console.log("[useCompanyInitialization] Profile completed");
    setShowProfileDialog(false);
  };
  
  const handleCompanyComplete = () => {
    console.log("[useCompanyInitialization] Company completed");
    setShowCompanyDialog(false);
  };
  
  const { handleCompanyCreated, handleCompanyTypeSelect } = useCompanyCallbacks(
    setShowCompanyDialog,
    forceGetUserCompanies,
    user
  );

  return {
    isPageLoading: false, // Always false to prevent infinite loading
    showCompanyDialog,
    setShowCompanyDialog,
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
