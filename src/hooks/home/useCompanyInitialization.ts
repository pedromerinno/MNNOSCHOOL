
import { useState, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useCompanyCallbacks } from "./useCompanyCallbacks";
import { useProfileCompletionCheck } from "./useProfileCompletionCheck";

export const useCompanyInitialization = () => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  
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

  // Verificar se o usuário realmente precisa do diálogo de empresa
  const shouldShowCompanyDialog = () => {
    // Não mostrar se está carregando
    if (isLoading || !user || !userProfile) {
      return false;
    }
    
    // Não mostrar para super admins
    if (userProfile.super_admin) {
      return false;
    }
    
    // Não mostrar se já tem empresas
    if (userCompanies.length > 0) {
      return false;
    }
    
    // Não mostrar se já foi mostrado antes
    if (hasShownCompanyDialogRef.current) {
      return false;
    }
    
    // Só mostrar se o perfil está completo mas não tem empresas
    return !!userProfile.display_name && userCompanies.length === 0;
  };

  // Controle unificado do diálogo de empresa
  const showCompanyDialog = profileShowCompanyDialog && shouldShowCompanyDialog();
  
  function setShowDialog(show: boolean) {
    profileSetShowCompanyDialog(show);
    
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
    isPageLoading: false,
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
