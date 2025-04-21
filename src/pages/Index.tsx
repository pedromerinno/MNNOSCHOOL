
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
  }, [user, userProfile, navigate]);
  
  // Verificação imediata do cache para evitar o skeleton se já temos dados
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // MODIFICAÇÃO: Melhorar controle do estado de carregamento da página
  // Não mostrar formulário de criação de empresa até termos certeza que os dados foram carregados
  useEffect(() => {
    // Se já temos empresa em cache, reduzir tempo de loading
    if (hasCachedCompany) {
      // Tempo muito reduzido para acelerar a transição
      setTimeout(() => setIsPageLoading(false), 50);
      return;
    }
    
    // Verificar se já carregamos os dados e podemos tomar uma decisão
    if ((fetchCount > 0 && !isLoading) || selectedCompany) {
      setIsPageLoading(false);
      
      // IMPORTANTE: Só mostrar formulário de empresa quando temos certeza que não há empresas
      // E os dados já estão completamente carregados
      if (fetchCount > 0 && userCompanies.length === 0 && !selectedCompany) {
        console.log("[Index] Carregamento completo: usuário não tem empresas, mostrando formulário");
        setShowCompanyForm(true);
      } else {
        console.log("[Index] Carregamento completo: usuário tem empresas, ocultando formulário");
        setShowCompanyForm(false);
      }
    }
    
    // Timeout de segurança para evitar loading infinito (mantendo a mesma lógica)
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizando loading por timeout de segurança");
        setIsPageLoading(false);
        
        // Verificar se deve mostrar formulário após timeout - apenas se dados estiverem carregados
        if (fetchCount > 0 && userCompanies.length === 0) {
          console.log("[Index] Após timeout: usuário não tem empresas, mostrando formulário");
          setShowCompanyForm(true);
        } else {
          console.log("[Index] Após timeout: mantendo estado atual do formulário");
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

  // Efeito para tentar recarregar empresas quando não temos nenhuma
  useEffect(() => {
    if (user && !isLoading && userCompanies.length === 0 && fetchCount > 0) {
      console.log("[Index] Usuário não tem empresas após carregamento. Verificando se precisa tentar novamente...");
      
      if (!userProfile?.interesses?.includes("onboarding_incomplete")) {
        console.log("[Index] Usuário não tem flag de onboarding incompleto mas não tem empresas. Tentando uma vez mais...");
        
        // Tentar forçar o carregamento de empresas uma vez mais
        if (user.id) {
          forceGetUserCompanies(user.id).then(companies => {
            if (companies.length === 0) {
              console.log("[Index] Mesmo após segunda tentativa, não há empresas. Mostrando formulário de cadastro...");
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
  }, [user, userProfile, isLoading, userCompanies, fetchCount, forceGetUserCompanies]);

  const handleCompanyCreated = async () => {
    toast.success("Empresa criada com sucesso!");
    setShowCompanyForm(false);
    
    if (user?.id) {
      await forceGetUserCompanies(user.id);
    }
  };

  // IMPORTANTE: Mostrar loading state durante o carregamento
  // Não mostrar formulário ou componente enquanto está carregando
  if (isPageLoading || (user && isLoading && userCompanies.length === 0)) {
    console.log("[Index] Mostrando estado de carregamento");
    return <LoadingState />;
  }

  // Mostrar formulário de cadastro quando não há empresas, MAS APENAS após o carregamento
  if (user && !isLoading && showCompanyForm) {
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
  if (user && !isLoading && userCompanies.length === 0 && !showCompanyForm) {
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
