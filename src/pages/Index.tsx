import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

const NoCompaniesAvailable = lazy(() => import("@/components/home/NoCompaniesAvailable").then(module => ({ default: module.NoCompaniesAvailable })));
const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ default: module.UserHome })));

const LoadingState = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-3xl space-y-8">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="h-4 w-60 rounded-full" />
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const { userCompanies, isLoading, fetchCount, selectedCompany, getUserCompanies, forceGetUserCompanies } = useCompanies();
  const { user, userProfile, refreshSession } = useAuth();
  const { getInitialSelectedCompany, clearCachedUserCompanies } = useCompanyCache();
  const navigate = useNavigate();
  const hasAttemptedForceLoad = useRef(false);
  const hasRedirectedToOnboarding = useRef(false);

  useEffect(() => {
    if (!user && !isLoading) {
      console.log("[Index] No user detected, attempting to refresh session");
      refreshSession().then(session => {
        if (!session) {
          console.log("[Index] Session refresh failed, redirecting to login");
          navigate("/login");
        }
      });
    }
  }, [user, isLoading, navigate, refreshSession]);

  const handleCompanyCreated = () => {
    setShowCompanyDialog(false);
    if (user?.id) {
      clearCachedUserCompanies();
      forceGetUserCompanies(user.id);
      toast.success("Empresa criada com sucesso!");
    }
  };
  
  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log("[Index] Company type selected:", isExisting ? "existing" : "new");
  };
  
  useEffect(() => {
    if (!user) return;
    
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[Index] Usuário precisa completar onboarding, redirecionando...");
      navigate("/onboarding", { replace: true });
      return;
    }
    
    if (user && !isLoading && userCompanies.length === 0 && fetchCount > 0) {
      console.log("[Index] Usuário não tem empresas após carregamento. Verificando se precisa de onboarding...");
      
      if (!userProfile?.interesses?.includes("onboarding_incomplete")) {
        console.log("[Index] Usuário não tem flag de onboarding incompleto mas não tem empresas. Tentar forçar carregamento...");
        
        if (!hasAttemptedForceLoad.current && user.id) {
          hasAttemptedForceLoad.current = true;
          
          clearCachedUserCompanies();
          
          forceGetUserCompanies(user.id).then(companies => {
            if (!companies || companies.length === 0) {
              if (!hasRedirectedToOnboarding.current) {
                console.log("[Index] Mesmo após forçar carregamento, não há empresas. Abrindo diálogo de criação de empresa...");
                setShowCompanyDialog(true);
              }
            } else {
              toast.success("Empresas carregadas com sucesso!");
              window.location.reload();
            }
          }).catch(err => {
            console.error("[Index] Erro ao tentar forçar carregamento de empresas:", err);
          });
        }
      }
    }
  }, [user, userProfile, navigate, isLoading, userCompanies, fetchCount, forceGetUserCompanies, clearCachedUserCompanies]);

  useEffect(() => {
    if (user && !isLoading && userCompanies.length === 0 && fetchCount > 0 && !hasRedirectedToOnboarding.current) {
      setShowCompanyDialog(true);
    }
  }, [user, isLoading, userCompanies.length, fetchCount]);
  
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  useEffect(() => {
    if (hasCachedCompany) {
      setTimeout(() => setIsPageLoading(false), 50);
      return;
    }
    
    if (selectedCompany || (fetchCount > 0 && !isLoading)) {
      setIsPageLoading(false);
    }
    
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizando loading por timeout de segurança");
        setIsPageLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchCount, selectedCompany, isPageLoading, hasCachedCompany]);

  useEffect(() => {
    if (user?.id && userCompanies.length === 0 && !isLoading && !hasAttemptedForceLoad.current) {
      console.log("[Index] Forçando carregamento inicial de empresas");
      hasAttemptedForceLoad.current = true;
      clearCachedUserCompanies();
      getUserCompanies(user.id, true).catch(err => {
        console.error("[Index] Erro no carregamento inicial:", err);
      });
    }
  }, [user?.id, getUserCompanies, userCompanies.length, isLoading, clearCachedUserCompanies]);

  if (hasCachedCompany && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingState />}>
          <UserHome />
        </Suspense>
      </div>
    );
  }

  if ((isPageLoading && !hasCachedCompany) || (user && isLoading && !hasCachedCompany)) {
    return <LoadingState />;
  }

  if (user && !isLoading && userCompanies.length === 0) {
    return (
      <>
        <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
          <DialogContent className="max-w-2xl p-0 h-[90vh] overflow-hidden flex flex-col">
            <DialogTitle className="sr-only">Configuração de Empresa</DialogTitle>
            <div className="bg-white rounded-t-lg flex-1 overflow-auto">
              <div className="p-6 md:p-8">
                <OnboardingProvider>
                  <CompanyStep 
                    onNext={() => {
                      console.log("[Index] CompanyStep onNext called");
                      setShowCompanyDialog(false);
                      if (user?.id) {
                        forceGetUserCompanies(user.id);
                      }
                    }}
                    onBack={() => setShowCompanyDialog(false)}
                    onCompanyTypeSelect={handleCompanyTypeSelect}
                    onCompanyCreated={handleCompanyCreated}
                  />
                </OnboardingProvider>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="min-h-screen bg-background">
          <Suspense fallback={<LoadingState />}>
            <NoCompaniesAvailable />
          </Suspense>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};

export default Index;
