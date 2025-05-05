
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
  setShowCompanyDialog: (show: boolean) => void
) => {
  const navigate = useNavigate();
  const hasAttemptedForceLoad = useRef(false);
  const hasRedirectedToOnboarding = useRef(false);

  // Check for onboarding status and redirect if needed
  useEffect(() => {
    if (!user) return;
    
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[Index] Usuário precisa completar onboarding, redirecionando...");
      navigate("/onboarding", { replace: true });
      hasRedirectedToOnboarding.current = true;
      return;
    }
    
    if (user && !isLoading && userCompanies.length === 0 && fetchCount > 0) {
      console.log("[Index] Usuário não tem empresas após carregamento. Verificando se precisa de onboarding...");
      
      if (!userProfile?.interesses?.includes("onboarding_incomplete")) {
        console.log("[Index] Usuário não tem flag de onboarding incompleto mas não tem empresas. Tentar forçar carregamento...");
        
        if (!hasAttemptedForceLoad.current && user.id) {
          hasAttemptedForceLoad.current = true;
          
          forceGetUserCompanies(user.id).then(companies => {
            if (companies.length === 0) {
              if (!hasRedirectedToOnboarding.current) {
                console.log("[Index] Mesmo após forçar carregamento, não há empresas. Abrindo diálogo de criação de empresa...");
                setShowCompanyDialog(true);
              }
            } else {
              toast.success("Empresas carregadas com sucesso!");
            }
          }).catch(err => {
            console.error("[Index] Erro ao tentar forçar carregamento de empresas:", err);
          });
        }
      }
    }
  }, [user, userProfile, navigate, isLoading, userCompanies, fetchCount, forceGetUserCompanies, setShowCompanyDialog]);

  return {
    hasAttemptedForceLoad,
    hasRedirectedToOnboarding
  };
};
