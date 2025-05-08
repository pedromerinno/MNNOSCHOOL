
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

export const useProfileCompletionCheck = () => {
  const { user, userProfile } = useAuth();
  const { userCompanies, isLoading: companiesLoading } = useCompanies();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if profile is complete
  const isProfileComplete = !!userProfile?.display_name;
  
  // Check if user has companies
  const hasCompanies = userCompanies.length > 0;

  useEffect(() => {
    // Only run this check when we have all necessary data
    if (user && !companiesLoading && userProfile) {
      setIsChecking(false);
      
      // If profile is not complete, show profile dialog
      if (!isProfileComplete) {
        setShowProfileDialog(true);
        return;
      }
      
      // If profile is complete but no companies, show company dialog
      if (isProfileComplete && !hasCompanies) {
        setShowCompanyDialog(true);
        return;
      }
    }
  }, [user, userProfile, companiesLoading, isProfileComplete, hasCompanies]);

  const handleProfileComplete = () => {
    setShowProfileDialog(false);
    
    // If user doesn't have companies, show company dialog next
    if (!hasCompanies) {
      setShowCompanyDialog(true);
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
    isChecking
  };
};
