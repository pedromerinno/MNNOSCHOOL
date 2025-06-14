
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

export const useIndexContentState = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { userCompanies, isLoading: companiesLoading, selectedCompany } = useCompanies();
  
  const [isPageReady, setIsPageReady] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  const hasCheckedInitialState = useRef(false);
  const dialogsInitialized = useRef(false);

  // Verificar se todos os dados essenciais estão prontos
  const allDataReady = !authLoading && user && userProfile && !companiesLoading;

  // Determinar se a página está pronta para mostrar conteúdo (menos restritivo)
  useEffect(() => {
    if (allDataReady && !hasCheckedInitialState.current) {
      console.log('[IndexContentState] Auth and profile data ready, setting page ready...');
      hasCheckedInitialState.current = true;
      setIsPageReady(true);
      
      // Verificar se precisa mostrar diálogos apenas após dados estarem prontos
      if (!dialogsInitialized.current) {
        dialogsInitialized.current = true;
        
        // Verificar perfil incompleto
        if (!userProfile?.display_name) {
          console.log('[IndexContentState] Profile incomplete, showing profile dialog');
          setShowProfileDialog(true);
          return;
        }
        
        // Verificar se precisa do diálogo de empresa (apenas para não-super-admins sem empresas)
        if (!userProfile?.super_admin && userCompanies.length === 0) {
          console.log('[IndexContentState] No companies found, showing company dialog');
          setShowCompanyDialog(true);
        }
      }
    }
  }, [allDataReady, userProfile, userCompanies.length]);

  // Handlers para os diálogos
  const handleProfileComplete = () => {
    setShowProfileDialog(false);
    
    // Após completar perfil, verificar se precisa do diálogo de empresa
    if (!userProfile?.super_admin && userCompanies.length === 0) {
      setShowCompanyDialog(true);
    }
  };

  const handleCompanyComplete = () => {
    setShowCompanyDialog(false);
  };

  const shouldShowContent = () => {
    if (!isPageReady) return false;
    
    // Super admin sempre pode ver o conteúdo
    if (userProfile?.super_admin) return true;
    
    // Usuário com empresas pode ver o conteúdo
    if (userCompanies.length > 0) return true;
    
    // Se não tem empresas mas não está mostrando os diálogos, mostrar conteúdo também
    if (!showCompanyDialog && !showProfileDialog) return true;
    
    return false;
  };

  const shouldShowNoCompaniesState = () => {
    return isPageReady && 
           !userProfile?.super_admin && 
           userCompanies.length === 0 && 
           !showCompanyDialog && 
           !showProfileDialog;
  };

  return {
    isPageReady,
    showCompanyDialog,
    setShowCompanyDialog,
    showProfileDialog,
    setShowProfileDialog,
    handleProfileComplete,
    handleCompanyComplete,
    shouldShowContent: shouldShowContent(),
    shouldShowNoCompaniesState: shouldShowNoCompaniesState(),
    allDataReady
  };
};
