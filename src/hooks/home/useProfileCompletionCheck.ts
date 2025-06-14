
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

export const useProfileCompletionCheck = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
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
    console.log("[useProfileCompletionCheck] Effect triggered", {
      isLoading,
      authLoading,
      user: !!user,
      userProfile: !!userProfile,
      profileChecked,
      hasInitializedDialogs: hasInitializedDialogs.current,
      userCompaniesLength: userCompanies.length,
      hasCompany,
      isSuperAdmin,
      isProfileComplete: isProfileComplete()
    });

    // Don't proceed if:
    // 1. Still loading companies or auth
    // 2. No user or profile data
    // 3. Already checked
    // 4. Already initialized dialogs
    if (isLoading || authLoading || !user || !userProfile || profileChecked || hasInitializedDialogs.current) {
      console.log("[useProfileCompletionCheck] Skipping - conditions not met");
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
    
    // CRITICAL: If user already has companies OR is super admin, don't show any dialogs
    if (hasCompany || isSuperAdmin) {
      console.log("[useProfileCompletionCheck] User has companies or is super admin, NO DIALOGS NEEDED");
      setShowProfileDialog(false);
      setShowCompanyDialog(false);
      return;
    }
    
    // Only proceed if user has NO companies AND is not super admin
    console.log("[useProfileCompletionCheck] User has NO companies and is not super admin, checking profile...");
    
    // Check if profile is incomplete
    if (!isProfileComplete()) {
      console.log("[useProfileCompletionCheck] Profile incomplete, showing profile dialog");
      setShowProfileDialog(true);
      setShowCompanyDialog(false);
    } else {
      // Profile is complete, no companies, not super admin - don't show anything
      // Let the main component handle the "no companies available" state
      console.log("[useProfileCompletionCheck] Profile complete but no companies - letting main component handle");
      setShowProfileDialog(false);
      setShowCompanyDialog(false);
    }
  }, [user, userProfile, hasCompany, profileChecked, isSuperAdmin, isLoading, authLoading, userCompanies.length]);
  
  // Force close dialogs when user gets companies or becomes super admin
  useEffect(() => {
    if ((hasCompany || isSuperAdmin) && (showCompanyDialog || showProfileDialog)) {
      console.log("[useProfileCompletionCheck] User now has companies or is super admin, closing all dialogs");
      setShowCompanyDialog(false);
      setShowProfileDialog(false);
    }
  }, [hasCompany, isSuperAdmin, showCompanyDialog, showProfileDialog]);
  
  const handleProfileComplete = () => {
    console.log("[useProfileCompletionCheck] Profile completed");
    setShowProfileDialog(false);
    
    // After profile completion, let the main component handle the flow
    // Don't automatically show company dialog
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
