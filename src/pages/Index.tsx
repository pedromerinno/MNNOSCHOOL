import { useState, useEffect, lazy, Suspense } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { LoadingPlaceholder } from "@/components/home/LoadingPlaceholder";

// Lazy-load components to improve initial loading time
const NoCompaniesAvailable = lazy(() => import("@/components/home/NoCompaniesAvailable").then(module => ({ default: module.NoCompaniesAvailable })));
const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ default: module.UserHome })));

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const { userCompanies, isLoading, fetchCount, forceGetUserCompanies } = useCompanies();
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  const navigate = useNavigate();
  const [formShowDelayComplete, setFormShowDelayComplete] = useState(false);
  
  // Debug logging to track state
  useEffect(() => {
    console.log("[Index] Current state:", {
      isPageLoading,
      showCompanyForm,
      formShowDelayComplete,
      userCompaniesCount: userCompanies?.length || 0,
      isLoading,
      fetchCount,
    });
  }, [isPageLoading, showCompanyForm, formShowDelayComplete, userCompanies, isLoading, fetchCount]);
  
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
  
  // Implementa o delay de 500ms para mostrar o formulário após determinar que não há empresas
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (!isPageLoading && userCompanies.length === 0 && fetchCount > 0) {
      console.log("[Index] Iniciando delay de 500ms para mostrar formulário de empresa");
      timeoutId = window.setTimeout(() => {
        console.log("[Index] Delay completo, habilitando exibição do formulário");
        setFormShowDelayComplete(true);
      }, 500);
    } else {
      setFormShowDelayComplete(false);
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isPageLoading, userCompanies.length, fetchCount]);
  
  // Melhorar controle do estado de carregamento da página e determinar quando mostrar o formulário
  useEffect(() => {
    // Se já temos empresa em cache, reduzir tempo de loading
    if (hasCachedCompany) {
      console.log("[Index] Empresa encontrada em cache, acelerando transição");
      setIsPageLoading(false);
      setShowCompanyForm(false);
      return;
    }
    
    // Verificar se já carregamos os dados de empresas do usuário
    if (!isLoading && fetchCount > 0) {
      console.log("[Index] Dados carregados, verificando empresas:", {
        userCompaniesCount: userCompanies?.length || 0
      });
      
      // Finalizar o estado de carregamento
      setIsPageLoading(false);
      
      // Mostrar formulário apenas quando confirmamos que não há empresas
      // E após o delay de exibição ter sido completado
      setShowCompanyForm(userCompanies.length === 0 && formShowDelayComplete);
    }
    
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizando loading por timeout de segurança");
        setIsPageLoading(false);
        
        // Verificar se deve mostrar formulário após timeout - apenas se dados estiverem carregados e delay completado
        if (fetchCount > 0 && formShowDelayComplete) {
          setShowCompanyForm(userCompanies.length === 0);
        }
      }
    }, 2000); // 2 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchCount, isPageLoading, hasCachedCompany, userCompanies, formShowDelayComplete]);

  // Atualiza o estado de showCompanyForm sempre que formShowDelayComplete mudar
  useEffect(() => {
    if (!isPageLoading && userCompanies.length === 0 && formShowDelayComplete) {
      console.log("[Index] Exibindo formulário após verificação completa e delay");
      setShowCompanyForm(true);
    } else if (userCompanies.length > 0) {
      console.log("[Index] Usuário tem empresas, ocultando formulário");
      setShowCompanyForm(false);
    }
  }, [formShowDelayComplete, isPageLoading, userCompanies.length]);

  const handleCompanyCreated = async () => {
    toast.success("Empresa criada com sucesso!");
    setShowCompanyForm(false);
    
    if (user?.id) {
      console.log("[Index] Empresa criada, forçando recarregamento de empresas");
      await forceGetUserCompanies(user.id);
    }
  };

  // Show loading placeholder during initial loading
  if (isPageLoading) {
    console.log("[Index] Mostrando estado de carregamento inicial");
    return <LoadingPlaceholder />;
  }

  // Show company registration form only when needed
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

  // Show home page with companies
  console.log("[Index] Renderizando página inicial com empresas");
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingPlaceholder />}>
        <UserHome />
      </Suspense>
    </div>
  );
};

export default Index;
