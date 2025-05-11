
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useOnboardingCheck = (
  user: any, 
  userProfile: any, 
  isLoading: boolean, 
  userCompanies: any[], 
  fetchCount: number,
  forceGetUserCompanies: (userId: string) => Promise<any>,
  setShowCompanyDialog: (show: boolean) => void,
  companyDialogTriggeredByProfile?: React.MutableRefObject<boolean>
) => {
  const navigate = useNavigate();
  const hasAttemptedForceLoad = useRef(false);
  const hasRedirectedToOnboarding = useRef(false);
  const hasOpenedDialogAfterForceLoad = useRef(false);

  // Check for onboarding status and redirect if needed
  useEffect(() => {
    if (!user) return;
    
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[useOnboardingCheck] Usuário precisa completar onboarding, redirecionando...");
      navigate("/onboarding", { replace: true });
      hasRedirectedToOnboarding.current = true;
      return;
    }
    
    // Only proceed if we're not redirecting to onboarding
    // and the company dialog wasn't already triggered by the profile check
    const profileAlreadyTriggeredDialog = companyDialogTriggeredByProfile && companyDialogTriggeredByProfile.current;
    
    if (user && 
        !isLoading && 
        userCompanies.length === 0 && 
        fetchCount > 0 && 
        !profileAlreadyTriggeredDialog) {
      console.log("[useOnboardingCheck] Usuário não tem empresas após carregamento. Verificando se precisa de onboarding...");
      
      if (!userProfile?.interesses?.includes("onboarding_incomplete")) {
        console.log("[useOnboardingCheck] Usuário não tem flag de onboarding incompleto mas não tem empresas. Tentar forçar carregamento...");
        
        if (!hasAttemptedForceLoad.current && user.id) {
          hasAttemptedForceLoad.current = true;
          
          forceGetUserCompanies(user.id).then(companies => {
            // Only show company dialog if user has no companies after forcing load
            // and if dialog hasn't been triggered by profile check
            if (companies.length === 0 && 
                !hasOpenedDialogAfterForceLoad.current && 
                !profileAlreadyTriggeredDialog) {
              hasOpenedDialogAfterForceLoad.current = true;
              console.log("[useOnboardingCheck] Mesmo após forçar carregamento, não há empresas. Abrindo diálogo de criação de empresa...");
              setShowCompanyDialog(true);
            } else if (companies.length > 0) {
              toast.success("Empresas carregadas com sucesso!");
            }
          }).catch(err => {
            console.error("[useOnboardingCheck] Erro ao tentar forçar carregamento de empresas:", err);
          });
        }
      }
    }
  }, [user, userProfile, navigate, isLoading, userCompanies, fetchCount, forceGetUserCompanies, setShowCompanyDialog, companyDialogTriggeredByProfile]);

  return {
    hasAttemptedForceLoad,
    hasRedirectedToOnboarding
  };
};
