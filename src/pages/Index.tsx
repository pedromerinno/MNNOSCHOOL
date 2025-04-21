
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
  // Data loading state
  const [dataFullyLoaded, setDataFullyLoaded] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  
  // Get necessary data and hooks
  const { 
    userCompanies, 
    isLoading, 
    fetchCount, 
    selectedCompany,
    getUserCompanies, 
    forceGetUserCompanies 
  } = useCompanies();
  
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  const navigate = useNavigate();
  
  // Debug logging to track state
  useEffect(() => {
    console.log("[Index] Current state:", {
      dataFullyLoaded,
      showCompanyForm,
      userCompaniesCount: userCompanies?.length || 0,
      isLoading,
      fetchCount,
      hasSelectedCompany: !!selectedCompany,
    });
  }, [dataFullyLoaded, showCompanyForm, userCompanies, isLoading, fetchCount, selectedCompany]);
  
  // Check if user needs onboarding
  useEffect(() => {
    if (!user) return;
    
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[Index] Usuário precisa completar onboarding, redirecionando...");
      navigate("/onboarding", { replace: true });
      return;
    }
  }, [user, userProfile, navigate]);
  
  // Force initial data load when user is available
  useEffect(() => {
    const loadInitialData = async () => {
      if (user?.id && !dataFullyLoaded) {
        console.log("[Index] Iniciando carregamento inicial forçado de empresas");
        
        try {
          // Always force a fresh load to ensure we have the latest data
          await forceGetUserCompanies(user.id);
          console.log("[Index] Carregamento inicial completo, dados obtidos");
        } catch (err) {
          console.error("[Index] Erro no carregamento inicial:", err);
        } finally {
          // Mark data as fully loaded regardless of result
          // This prevents endless loading if there's an error
          setDataFullyLoaded(true);
        }
      }
    };
    
    loadInitialData();
  }, [user?.id, forceGetUserCompanies, dataFullyLoaded]);
  
  // Process data after loading
  useEffect(() => {
    // Only make decisions once data is fully loaded
    if (dataFullyLoaded) {
      console.log("[Index] Processando dados após carregamento completo:", {
        userCompaniesCount: userCompanies?.length || 0,
        hasSelectedCompany: !!selectedCompany
      });
      
      if (userCompanies.length === 0 && !selectedCompany) {
        console.log("[Index] Nenhuma empresa encontrada, mostrando formulário");
        setShowCompanyForm(true);
      } else {
        console.log("[Index] Empresas encontradas, mostrando página inicial");
        setShowCompanyForm(false);
      }
    }
  }, [dataFullyLoaded, userCompanies, selectedCompany]);

  const handleCompanyCreated = async () => {
    toast.success("Empresa criada com sucesso!");
    setShowCompanyForm(false);
    
    if (user?.id) {
      console.log("[Index] Empresa criada, forçando recarregamento de empresas");
      await forceGetUserCompanies(user.id);
    }
  };

  // IMPORTANT: Show loading state until data is fully loaded
  if (!dataFullyLoaded) {
    console.log("[Index] Dados ainda estão carregando, mostrando estado de carregamento");
    return <LoadingState />;
  }

  // Show company registration form only if we confirmed user has no companies
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

  // Show NoCompaniesAvailable when we confirmed user has no companies
  if (userCompanies.length === 0) {
    console.log("[Index] Renderizando componente de sem empresas disponíveis");
    return (
      <Suspense fallback={<LoadingState />}>
        <NoCompaniesAvailable />
      </Suspense>
    );
  }

  // Show home page when user has companies
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
