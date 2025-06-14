
import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";

export const useCompanyInitialization = () => {
  const { userCompanies, isLoading, selectedCompany } = useCompanies();
  const { user } = useAuth();
  
  // Estados de diálogo sempre falsos por padrão
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);

  console.log("[useCompanyInitialization] State check", {
    userCompaniesLength: userCompanies.length,
    showCompanyDialog: false,
    showProfileDialog: false,
    userEmail: user?.email,
    hasUser: !!user,
    isLoading
  });
  
  const handleProfileComplete = () => {
    console.log("[useCompanyInitialization] Profile completed");
    setShowProfileDialog(false);
  };
  
  const handleCompanyComplete = () => {
    console.log("[useCompanyInitialization] Company completed");
    setShowCompanyDialog(false);
  };
  
  const handleCompanyCreated = () => {
    console.log("[useCompanyInitialization] Company created");
    setShowCompanyDialog(false);
  };

  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log("[useCompanyInitialization] Company type selected:", isExisting ? "existing" : "new");
  };

  return {
    isPageLoading: false, // Sempre falso
    showCompanyDialog: false, // Sempre falso 
    setShowCompanyDialog,
    showProfileDialog: false, // Sempre falso
    setShowProfileDialog,
    userCompanies,
    isLoading,
    user,
    handleCompanyCreated,
    handleCompanyTypeSelect,
    handleProfileComplete,
    handleCompanyComplete,
    forceGetUserCompanies: () => {},
    hasCachedCompany: false,
    hasShownCompanyDialog: { current: false }
  };
};
