
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
    console.log("[useProfileCompletionCheck] Effect triggered", {
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

    // Don't proceed if:
    // 1. Still loading companies
    // 2. No user or profile data
    // 3. Already checked
    // 4. Already initialized dialogs
    if (isLoading || !user || !userProfile || profileChecked || hasInitializedDialogs.current) {
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
    
    // CRITICAL: If user already has companies, don't show any dialogs
    if (hasCompany) {
      console.log("[useProfileCompletionCheck] User has companies, NO DIALOGS NEEDED");
      setShowProfileDialog(false);
      setShowCompanyDialog(false);
      return;
    }
    
    // Only proceed if user has NO companies
    console.log("[useProfileCompletionCheck] User has NO companies, checking profile...");
    
    // Check if profile is incomplete
    if (!isProfileComplete()) {
      console.log("[useProfileCompletionCheck] Profile incomplete, showing profile dialog");
      setShowProfileDialog(true);
      setShowCompanyDialog(false);
    } else if (!isSuperAdmin) {
      // Only show company dialog if:
      // 1. Profile is complete
      // 2. User is not super admin
      // 3. User has no companies (already checked above)
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
  
  // Close company dialog when user gets companies
  useEffect(() => {
    if (hasCompany && showCompanyDialog) {
      console.log("[useProfileCompletionCheck] User now has companies, closing company dialog");
      setShowCompanyDialog(false);
    }
  }, [hasCompany, showCompanyDialog]);

  // Additional safety check - force close dialogs if user has companies
  useEffect(() => {
    if (hasCompany && userCompanies.length > 0) {
      console.log("[useProfileCompletionCheck] SAFETY CHECK: User has companies, forcing all dialogs closed");
      setShowProfileDialog(false);
      setShowCompanyDialog(false);
    }
  }, [hasCompany, userCompanies.length]);
  
  const handleProfileComplete = () => {
    console.log("[useProfileCompletionCheck] Profile completed");
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
