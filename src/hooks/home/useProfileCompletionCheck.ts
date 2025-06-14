
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
  
  // Check profile completion status - only once and only when data is fully loaded
  useEffect(() => {
    // Wait for all data to be loaded before making decisions
    if (user && userProfile && !profileChecked && !hasInitializedDialogs.current && !isLoading) {
      console.log("[useProfileCompletionCheck] Checking profile completion", {
        hasCompany,
        isSuperAdmin,
        isProfileComplete: isProfileComplete()
      });
      
      setProfileChecked(true);
      hasInitializedDialogs.current = true;
      
      // Check if profile is incomplete
      if (!isProfileComplete()) {
        console.log("[useProfileCompletionCheck] Profile incomplete, showing profile dialog");
        setShowProfileDialog(true);
      } else if (!isSuperAdmin && !hasCompany) {
        // Only open company dialog if:
        // 1. Profile is complete
        // 2. User is not super admin
        // 3. User has no companies
        // 4. Companies data has been loaded (not loading)
        console.log("[useProfileCompletionCheck] Profile complete but no companies, showing company dialog");
        setShowCompanyDialog(true);
        companyDialogTriggeredByProfile.current = true;
      } else {
        console.log("[useProfileCompletionCheck] User already has companies or is super admin, no dialog needed");
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
    
    // Only open company dialog if user still has no companies and is not super admin
    // and companies data has been loaded
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
