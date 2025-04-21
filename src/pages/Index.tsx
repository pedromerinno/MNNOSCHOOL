import { useState, useEffect, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

// Lazy-load components to improve initial loading time
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
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  const navigate = useNavigate();

  const handleCompanyCreated = () => {
    setShowCompanyDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
    }
  };
  
  useEffect(() => {
    if (!user) return;
    
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[Index] Usuário precisa completar onboarding, redirecionando...");
      navigate("/onboarding", { replace: true });
      return;
    }
    
    // Se o usuário está logado e não tem empresas, isso pode ser um problema
    if (user && !isLoading && userCompanies.length === 0 && fetchCount > 0) {
      console.log("[Index] Usuário não tem empresas após carregamento. Verificando se precisa de onboarding...");
      
      if (!userProfile?.interesses?.includes("onboarding_incomplete")) {
        console.log("[Index] Usuário não tem flag de onboarding incompleto mas não tem empresas. Tentar forçar carregamento...");
        
        // Tentar forçar o carregamento de empresas uma vez
        if (user.id) {
          forceGetUserCompanies(user.id).then(companies => {
            if (companies.length === 0) {
              console.log("[Index] Mesmo após forçar carregamento, não há empresas. Redirecionando para onboarding...");
              navigate("/onboarding", { replace: true });
            } else {
              toast.success("Empresas carregadas com sucesso!");
            }
          }).catch(err => {
            console.error("[Index] Erro ao tentar forçar carregamento de empresas:", err);
          });
        }
      }
    }
  }, [user, userProfile, navigate, isLoading, userCompanies, fetchCount, forceGetUserCompanies]);
  
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
    if (user?.id && userCompanies.length === 0 && !isLoading) {
      console.log("[Index] Forçando carregamento inicial de empresas");
      getUserCompanies(user.id, true).catch(err => {
        console.error("[Index] Erro no carregamento inicial:", err);
      });
    }
  }, [user?.id, getUserCompanies, userCompanies.length, isLoading]);

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
          <DialogContent className="max-w-4xl p-0">
            <div className="bg-white rounded-3xl">
              <div className="p-16">
                <OnboardingProvider>
                  <CompanyStep 
                    onNext={() => {}} 
                    onBack={() => setShowCompanyDialog(false)}
                    onCompanyTypeSelect={() => {}}
                    onCompanyCreated={handleCompanyCreated}
                  />
                </OnboardingProvider>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="min-h-screen bg-background">
          <Suspense fallback={<LoadingState />}>
            <UserHome />
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
