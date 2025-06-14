
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

export const useProfileCompletionCheck = () => {
  const { user, userProfile } = useAuth();
  const { userCompanies, isLoading } = useCompanies();
  
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const hasInitializedDialogs = useRef(false);
  const companyDialogTriggeredByProfile = useRef(false);
  
  const isProfileComplete = () => {
    return !!userProfile?.display_name;
  };
  
  const hasCompany = userCompanies.length > 0;
  const isSuperAdmin = userProfile?.super_admin;
  
  // Check profile completion status - only once
  useEffect(() => {
    if (user && userProfile && !profileChecked && !hasInitializedDialogs.current && !isLoading) {
      console.log("[useProfileCompletionCheck] Checking profile completion");
      setProfileChecked(true);
      hasInitializedDialogs.current = true;
      
      // Check if profile is incomplete
      if (!isProfileComplete()) {
        console.log("[useProfileCompletionCheck] Profile incomplete, showing profile dialog");
        setShowProfileDialog(true);
      } else if (!isSuperAdmin && !hasCompany) {
        // Only open company dialog if profile is complete, user is not super admin, and has no companies
        console.log("[useProfileCompletionCheck] Profile complete but no companies, showing company dialog");
        setShowCompanyDialog(true);
        companyDialogTriggeredByProfile.current = true;
      }
    }
  }, [user, userProfile, hasCompany, profileChecked, isSuperAdmin, isLoading]);
  
  // Close company dialog when user gets companies
  useEffect(() => {
    if (hasCompany && showCompanyDialog) {
      console.log("[useProfileCompletionCheck] User now has companies, closing company dialog");
      setShowCompanyDialog(false);
    }
  }, [hasCompany, showCompanyDialog]);
  
  const handleProfileComplete = () => {
    // Close profile dialog
    setShowProfileDialog(false);
    
    // Open company dialog if user has no companies and is not super admin
    if (!isSuperAdmin && !hasCompany) {
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
