
import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IndexLoadingState } from "./IndexLoadingState";
import { CompanyCreationDialog } from "./CompanyCreationDialog";

const NoCompaniesAvailable = lazy(() => import("@/components/home/NoCompaniesAvailable").then(module => ({ default: module.NoCompaniesAvailable })));
const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ default: module.UserHome })));

export const IndexContent = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const { userCompanies, isLoading, fetchCount, selectedCompany, getUserCompanies, forceGetUserCompanies } = useCompanies();
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  const navigate = useNavigate();
  const hasAttemptedForceLoad = useRef(false);
  const hasRedirectedToOnboarding = useRef(false);

  const handleCompanyCreated = () => {
    setShowCompanyDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
      toast.success("Empresa criada com sucesso!");
    }
  };
  
  const handleCompanyTypeSelect = (isExisting: boolean) => {
    // This is needed for the CompanyStep component
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
  }, [user, userProfile, navigate, isLoading, userCompanies, fetchCount, forceGetUserCompanies]);

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
      getUserCompanies(user.id, true).catch(err => {
        console.error("[Index] Erro no carregamento inicial:", err);
      });
    }
  }, [user?.id, getUserCompanies, userCompanies.length, isLoading]);

  if (hasCachedCompany && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<IndexLoadingState />}>
          <UserHome />
        </Suspense>
      </div>
    );
  }

  if ((isPageLoading && !hasCachedCompany) || (user && isLoading && !hasCachedCompany)) {
    return <IndexLoadingState />;
  }

  if (user && !isLoading && userCompanies.length === 0) {
    return (
      <>
        <CompanyCreationDialog 
          open={showCompanyDialog}
          onOpenChange={setShowCompanyDialog}
          onCompanyTypeSelect={handleCompanyTypeSelect}
          onCompanyCreated={handleCompanyCreated}
          userId={user?.id}
          forceGetUserCompanies={forceGetUserCompanies}
        />
        
        <div className="min-h-screen bg-background">
          <Suspense fallback={<IndexLoadingState />}>
            <NoCompaniesAvailable />
          </Suspense>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<IndexLoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};
