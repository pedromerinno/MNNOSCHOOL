
import { useState, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useCompanyDialogState } from "./useCompanyDialogState";
import { useCompanyCallbacks } from "./useCompanyCallbacks";
import { useProfileCompletionCheck } from "./useProfileCompletionCheck";

export const useCompanyInitialization = () => {
  const [isPageLoading, setIsPageLoading] = useState(false); // Começar com false para carregar mais rápido
  
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
  
  // Use the profile completion check first
  const {
    showProfileDialog,
    setShowProfileDialog,
    showCompanyDialog: profileShowCompanyDialog,
    setShowCompanyDialog: profileSetShowCompanyDialog,
    handleProfileComplete,
    handleCompanyComplete,
    companyDialogTriggeredByProfile
  } = useProfileCompletionCheck();

  // Simplificar o estado do diálogo de empresa
  const { showCompanyDialog: companyDialogState, setShowCompanyDialog: setCompanyDialogState } = useCompanyDialogState(
    userCompanies, 
    isLoading, 
    1, // fetchCount simplificado
    useRef(false) // hasRedirectedToOnboarding simplificado
  );
  
  // Unificar os estados dos diálogos
  const showCompanyDialog = profileShowCompanyDialog || companyDialogState;
  
  function setShowDialog(show: boolean) {
    profileSetShowCompanyDialog(show);
    setCompanyDialogState(show);
    
    if (show) {
      hasShownCompanyDialogRef.current = true;
    }
  }
  
  const { handleCompanyCreated, handleCompanyTypeSelect } = useCompanyCallbacks(
    setShowDialog,
    forceGetUserCompanies,
    user
  );

  return {
    isPageLoading: false, // Sempre false para carregamento mais rápido
    showCompanyDialog,
    setShowCompanyDialog: setShowDialog,
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
