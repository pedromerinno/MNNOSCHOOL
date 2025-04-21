
import { useState, useEffect, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";

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
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const { userCompanies, isLoading, fetchCount, selectedCompany, getUserCompanies, forceGetUserCompanies } = useCompanies();
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  const navigate = useNavigate();
  
  // Verificar necessidade de onboarding
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
              console.log("[Index] Mesmo após forçar carregamento, não há empresas. Mostrando formulário de cadastro...");
              setShowCompanyForm(true);
            } else {
              toast.success("Empresas carregadas com sucesso!");
              setShowCompanyForm(false);
            }
          }).catch(err => {
            console.error("[Index] Erro ao tentar forçar carregamento de empresas:", err);
          });
        }
      }
    }
  }, [user, userProfile, navigate, isLoading, userCompanies, fetchCount, forceGetUserCompanies]);
  
  // Verificação imediata do cache para evitar o skeleton se já temos dados
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // Melhor controle do estado de carregamento da página
  useEffect(() => {
    // Se já temos empresa em cache, reduzir tempo de loading ou até pular
    if (hasCachedCompany) {
      // Tempo muito reduzido para acelerar a transição
      setTimeout(() => setIsPageLoading(false), 50);
      return;
    }
    
    // Finaliza o carregamento quando temos uma empresa selecionada ou os dados já foram carregados
    if (selectedCompany || (fetchCount > 0 && !isLoading)) {
      setIsPageLoading(false);
      // Só mostrar formulário de empresa quando temos certeza que não há empresas
      if (fetchCount > 0 && userCompanies.length === 0 && !selectedCompany) {
        setShowCompanyForm(true);
      } else {
        setShowCompanyForm(false);
      }
    }
    
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizando loading por timeout de segurança");
        setIsPageLoading(false);
        // Verificar se deve mostrar formulário após timeout
        if (userCompanies.length === 0) {
          setShowCompanyForm(true);
        }
      }
    }, 2000); // 2 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchCount, selectedCompany, isPageLoading, hasCachedCompany, userCompanies.length]);

  // Carregamento inicial forçado
  useEffect(() => {
    if (user?.id && userCompanies.length === 0 && !isLoading) {
      console.log("[Index] Forçando carregamento inicial de empresas");
      getUserCompanies(user.id, true).catch(err => {
        console.error("[Index] Erro no carregamento inicial:", err);
      });
    }
  }, [user?.id, getUserCompanies, userCompanies.length, isLoading]);

  const handleCompanyCreated = async () => {
    toast.success("Empresa criada com sucesso!");
    setShowCompanyForm(false);
    
    if (user?.id) {
      await forceGetUserCompanies(user.id);
    }
  };

  // Mostrar loading state durante o carregamento
  if (isPageLoading || (user && isLoading && userCompanies.length === 0)) {
    return <LoadingState />;
  }

  // Mostrar formulário de cadastro quando não há empresas
  if (user && !isLoading && showCompanyForm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Cadastrar Empresa</h1>
          <CompanyStep 
            onNext={() => {}} 
            onBack={() => {}} 
            onCompanyTypeSelect={() => {}} 
            onCompanyCreated={handleCompanyCreated}
            hideBack={true}
          />
        </div>
      </div>
    );
  }

  // Mostrar NoCompaniesAvailable quando terminamos de carregar e não há empresas
  if (user && !isLoading && userCompanies.length === 0 && !showCompanyForm) {
    return (
      <Suspense fallback={<LoadingState />}>
        <NoCompaniesAvailable />
      </Suspense>
    );
  }

  // Mostrar página inicial quando temos empresas
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};

export default Index;
