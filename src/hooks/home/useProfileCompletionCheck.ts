
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

export const useProfileCompletionCheck = () => {
  const { user, userProfile } = useAuth();
  const { userCompanies } = useCompanies();
  
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const hasInitializedDialogs = useRef(false);
  const companyDialogTriggeredByProfile = useRef(false);
  
  const isProfileComplete = () => {
    // Profile is complete if display_name exists
    return !!userProfile?.display_name;
  };
  
  const hasCompany = userCompanies.length > 0;
  
  // Check profile completion status - only once
  useEffect(() => {
    if (user && userProfile && !profileChecked && !hasInitializedDialogs.current) {
      console.log("[useProfileCompletionCheck] Checking profile completion");
      setProfileChecked(true);
      hasInitializedDialogs.current = true;
      
      // Check if profile is incomplete
      if (!isProfileComplete()) {
        console.log("[useProfileCompletionCheck] Profile incomplete, showing profile dialog");
        setShowProfileDialog(true);
      } else if (!hasCompany) {
        // Only open company dialog if profile is complete but user has no companies
        console.log("[useProfileCompletionCheck] Profile complete but no companies, showing company dialog");
        setShowCompanyDialog(true);
        companyDialogTriggeredByProfile.current = true;
      }
    }
  }, [user, userProfile, hasCompany, profileChecked]);
  
  const handleProfileComplete = () => {
    // Close profile dialog
    setShowProfileDialog(false);
    
    // Open company dialog if user has no companies
    if (!hasCompany) {
      console.log("[useProfileCompletionCheck] Profile completed, showing company dialog");
      setShowCompanyDialog(true);
      companyDialogTriggeredByProfile.current = true;
    }
  };
  
  const handleCompanyComplete = () => {
    setShowCompanyDialog(false);
  };
  
  return {
    showProfileDialog,
    setShowProfileDialog,
    showCompanyDialog,
    setShowCompanyDialog,
    handleProfileComplete,
    handleCompanyComplete,
    isProfileComplete: isProfileComplete(),
    hasInitializedDialogs,
    companyDialogTriggeredByProfile
  };
};
