
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
  
  // Debug logging to track state
  useEffect(() => {
    console.log("[Index] Current state:", {
      isPageLoading,
      showCompanyForm,
      userCompaniesCount: userCompanies?.length || 0,
      isLoading,
      fetchCount,
      hasSelectedCompany: !!selectedCompany,
    });
  }, [isPageLoading, showCompanyForm, userCompanies, isLoading, fetchCount, selectedCompany]);
  
  // Verificar necessidade de onboarding
  useEffect(() => {
    if (!user) return;
    
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[Index] Usuário precisa completar onboarding, redirecionando...");
      navigate("/onboarding", { replace: true });
      return;
    }
  }, [user, userProfile, navigate]);
  
  // Verificação imediata do cache para evitar o skeleton se já temos dados
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // Força carregamento inicial uma vez
  useEffect(() => {
    if (user?.id && !isLoading && fetchCount === 0) {
      console.log("[Index] Iniciando carregamento inicial forçado de empresas");
      forceGetUserCompanies(user.id).catch(err => {
        console.error("[Index] Erro no carregamento inicial forçado:", err);
      });
    }
  }, [user?.id, isLoading, fetchCount, forceGetUserCompanies]);
  
  // Melhorar controle do estado de carregamento da página
  useEffect(() => {
    // Se já temos empresa em cache, reduzir tempo de loading
    if (hasCachedCompany) {
      console.log("[Index] Empresa encontrada em cache, acelerando transição");
      setTimeout(() => setIsPageLoading(false), 50);
      return;
    }
    
    // Verificar se já carregamos os dados e podemos tomar uma decisão
    if (!isLoading && fetchCount > 0) {
      console.log("[Index] Dados carregados, verificando empresas:", {
        userCompaniesCount: userCompanies?.length || 0,
        hasSelectedCompany: !!selectedCompany
      });
      
      // Importante: Definir primeiro isPageLoading como false, antes de decidir sobre showCompanyForm
      setIsPageLoading(false);
      
      // Só mostrar formulário de empresa quando temos certeza que não há empresas
      // E os dados já estão completamente carregados
      if (userCompanies.length === 0 && !selectedCompany) {
        console.log("[Index] Carregamento completo: usuário não tem empresas, mostrando formulário");
        setShowCompanyForm(true);
      } else {
        console.log("[Index] Carregamento completo: usuário tem empresas, ocultando formulário");
        setShowCompanyForm(false);
      }
    }
    
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizando loading por timeout de segurança");
        setIsPageLoading(false);
        
        // Verificar se deve mostrar formulário após timeout - apenas se dados estiverem carregados
        if (fetchCount > 0 && userCompanies.length === 0 && !selectedCompany) {
          console.log("[Index] Após timeout: usuário não tem empresas, mostrando formulário");
          setShowCompanyForm(true);
        } else {
          console.log("[Index] Após timeout: usuário tem empresas ou não temos dados suficientes");
          setShowCompanyForm(false);
        }
      }
    }, 2000); // 2 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchCount, selectedCompany, isPageLoading, hasCachedCompany, userCompanies]);

  const handleCompanyCreated = async () => {
    toast.success("Empresa criada com sucesso!");
    setShowCompanyForm(false);
    
    if (user?.id) {
      console.log("[Index] Empresa criada, forçando recarregamento de empresas");
      await forceGetUserCompanies(user.id);
    }
  };

  // IMPORTANTE: Mostrar loading state durante o carregamento
  if (isPageLoading) {
    console.log("[Index] Mostrando estado de carregamento");
    return <LoadingState />;
  }

  // Mostrar formulário de cadastro apenas quando temos certeza que não há empresas
  if (showCompanyForm) {
    console.log("[Index] Renderizando formulário de cadastro de empresa");
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
  if (userCompanies.length === 0 && fetchCount > 0) {
    console.log("[Index] Renderizando componente de sem empresas disponíveis");
    return (
      <Suspense fallback={<LoadingState />}>
        <NoCompaniesAvailable />
      </Suspense>
    );
  }

  // Mostrar página inicial quando temos empresas
  console.log("[Index] Renderizando página inicial com empresas");
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};

export default Index;
