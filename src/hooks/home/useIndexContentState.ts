
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useOptimizedCache } from "@/hooks/useOptimizedCache";

export const useIndexContentState = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { userCompanies, isLoading: companiesLoading, selectedCompany } = useCompanies();
  const { isCacheReady, getCacheState } = useOptimizedCache();
  
  const [isPageReady, setIsPageReady] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  const hasCheckedInitialState = useRef(false);
  const dialogsInitialized = useRef(false);

  // Verificar se todos os dados essenciais estão prontos
  const allDataReady = !authLoading && user && userProfile && !companiesLoading;
  const cacheReady = isCacheReady('userCompanies') && isCacheReady('selectedCompany');

  // Determinar se a página está pronta para mostrar conteúdo
  useEffect(() => {
    if (allDataReady && cacheReady && !hasCheckedInitialState.current) {
      console.log('[IndexContentState] All data ready, checking initial state...');
      hasCheckedInitialState.current = true;
      
      // Pequeno delay para garantir que todos os dados estão estabilizados
      setTimeout(() => {
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
      }, 100);
    }
  }, [allDataReady, cacheReady, userProfile, userCompanies.length]);

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
    
    // Caso contrário, mostrar estado de "sem empresas"
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
    allDataReady,
    cacheReady
  };
};
