
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
  
  console.log("[useProfileCompletionCheck] DETAILED STATE:", {
    isLoading,
    user: !!user,
    userProfile: !!userProfile,
    profileChecked,
    hasInitializedDialogs: hasInitializedDialogs.current,
    userCompaniesLength: userCompanies.length,
    hasCompany,
    isSuperAdmin,
    isProfileComplete: isProfileComplete(),
    showProfileDialog,
    showCompanyDialog
  });

  // CRITICAL: If user has companies, FORCE all dialogs to close
  useEffect(() => {
    if (hasCompany && userCompanies.length > 0) {
      console.log("[useProfileCompletionCheck] FORCE CLOSE: User has companies, closing ALL dialogs");
      setShowProfileDialog(false);
      setShowCompanyDialog(false);
      return;
    }
  }, [hasCompany, userCompanies.length]);

  // Check profile completion status - only when all data is loaded and verified
  useEffect(() => {
    console.log("[useProfileCompletionCheck] Main effect triggered", {
      isLoading,
      user: !!user,
      userProfile: !!userProfile,
      profileChecked,
      hasInitializedDialogs: hasInitializedDialogs.current,
      userCompaniesLength: userCompanies.length,
      hasCompany,
      isSuperAdmin,
      isProfileComplete: isProfileComplete()
    });

    // FIRST CHECK: If user has companies, don't show ANY dialogs
    if (hasCompany && userCompanies.length > 0) {
      console.log("[useProfileCompletionCheck] USER HAS COMPANIES - NO DIALOGS ALLOWED");
      setShowProfileDialog(false);
      setShowCompanyDialog(false);
      setProfileChecked(true);
      hasInitializedDialogs.current = true;
      return;
    }

    // Don't proceed if:
    // 1. Still loading companies
    // 2. No user or profile data
    // 3. Already checked
    // 4. Already initialized dialogs
    if (isLoading || !user || !userProfile || profileChecked || hasInitializedDialogs.current) {
      console.log("[useProfileCompletionCheck] Skipping - conditions not met");
      return;
    }
    
    console.log("[useProfileCompletionCheck] Proceeding with dialog logic for user with NO companies");
    
    setProfileChecked(true);
    hasInitializedDialogs.current = true;
    
    // Check if profile is incomplete
    if (!isProfileComplete()) {
      console.log("[useProfileCompletionCheck] Profile incomplete, showing profile dialog");
      setShowProfileDialog(true);
      setShowCompanyDialog(false);
    } else if (!isSuperAdmin) {
      // Only show company dialog if:
      // 1. Profile is complete
      // 2. User is not super admin
      // 3. User has no companies (already verified above)
      console.log("[useProfileCompletionCheck] Profile complete but no companies, showing company dialog");
      setShowProfileDialog(false);
      setShowCompanyDialog(true);
      companyDialogTriggeredByProfile.current = true;
    } else {
      console.log("[useProfileCompletionCheck] Super admin with no companies - no dialogs");
      setShowProfileDialog(false);
      setShowCompanyDialog(false);
    }
  }, [user, userProfile, hasCompany, profileChecked, isSuperAdmin, isLoading, userCompanies.length]);
  
  const handleProfileComplete = () => {
    console.log("[useProfileCompletionCheck] Profile completed");
    setShowProfileDialog(false);
    
    // Re-check if user has companies after profile completion
    if (hasCompany && userCompanies.length > 0) {
      console.log("[useProfileCompletionCheck] Profile completed - user now has companies, no company dialog");
      setShowCompanyDialog(false);
      return;
    }
    
    // Only open company dialog if user still has no companies and is not super admin
    if (!isSuperAdmin && !hasCompany && !isLoading) {
      console.log("[useProfileCompletionCheck] Profile completed, checking if company dialog needed");
      setShowCompanyDialog(true);
      companyDialogTriggeredByProfile.current = true;
    }
  };
  
  const handleCompanyComplete = () => {
    console.log("[useProfileCompletionCheck] Company completed");
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
