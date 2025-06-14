
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
  
  // Check profile completion status - only when all data is loaded and verified
  useEffect(() => {
    // Don't proceed if:
    // 1. Still loading companies
    // 2. No user or profile data
    // 3. Already checked
    // 4. Already initialized dialogs
    if (isLoading || !user || !userProfile || profileChecked || hasInitializedDialogs.current) {
      return;
    }
    
    console.log("[useProfileCompletionCheck] Checking profile completion", {
      hasCompany,
      isSuperAdmin,
      isProfileComplete: isProfileComplete(),
      userCompaniesLength: userCompanies.length
    });
    
    setProfileChecked(true);
    hasInitializedDialogs.current = true;
    
    // If user already has companies, don't show any dialogs
    if (hasCompany) {
      console.log("[useProfileCompletionCheck] User has companies, no dialogs needed");
      return;
    }
    
    // Check if profile is incomplete
    if (!isProfileComplete()) {
      console.log("[useProfileCompletionCheck] Profile incomplete, showing profile dialog");
      setShowProfileDialog(true);
    } else if (!isSuperAdmin) {
      // Only show company dialog if:
      // 1. Profile is complete
      // 2. User is not super admin
      // 3. User has no companies (already checked above)
      console.log("[useProfileCompletionCheck] Profile complete but no companies, showing company dialog");
      setShowCompanyDialog(true);
      companyDialogTriggeredByProfile.current = true;
    }
  }, [user, userProfile, hasCompany, profileChecked, isSuperAdmin, isLoading, userCompanies.length]);
  
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
    
    // Only open company dialog if user still has no companies and is not super admin
    if (!isSuperAdmin && !hasCompany && !isLoading) {
      console.log("[useProfileCompletionCheck] Profile completed, checking if company dialog needed");
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
