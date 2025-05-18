
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { toast } from "sonner";

export const ProtectedRoute = () => {
  const { user, loading, session, userProfile } = useAuth();
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";
  
  // Só carrega os dados de empresas se não estiver na página de onboarding
  const { userCompanies, isLoading: companiesLoading } = useCompanies({
    skipLoadingInOnboarding: isOnboarding
  });
  
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Verificação de estado de autenticação
  useEffect(() => {
    console.log("ProtectedRoute: Verificando autenticação");
    
    // Define um timeout mais curto para o carregamento da autenticação (5 segundos)
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("ProtectedRoute: Tempo limite de carregamento atingido");
        setInitialLoadDone(true);
        setAuthError("Tempo limite de autenticação excedido. Por favor, recarregue a página ou faça login novamente.");
        toast.error("Tempo limite de autenticação excedido. Tente recarregar a página.");
      }
    }, 5000);
    
    // Se o carregamento for concluído, marca como pronto
    if (!loading) {
      console.log("ProtectedRoute: Carregamento concluído");
      setInitialLoadDone(true);
      clearTimeout(timeoutId);
    }
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Mostrar um loading mais simplificado e rápido
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mostra erro de autenticação se houver
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg max-w-md w-full shadow-md dark:bg-amber-900/30 dark:border-amber-800">
          <div className="flex items-start mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 mt-1 dark:text-amber-400" />
            <div>
              <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200">Problema de autenticação</h3>
              <p className="text-amber-700 mt-1 dark:text-amber-300">{authError}</p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem('supabase.auth.token');
                window.location.href = '/login';
              }}
            >
              Ir para login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!user) {
    console.log("ProtectedRoute: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Verificar se precisa fazer onboarding inicial
  // IMPORTANTE: Precisamos ter certeza que esta verificação seja feita corretamente
  const needsOnboarding = userProfile?.primeiro_login === true || 
                         (userProfile?.interesses && userProfile.interesses.includes("onboarding_incomplete"));
                         
  console.log("ProtectedRoute: Verificando necessidade de onboarding:", { 
    userProfile,
    primeiro_login: userProfile?.primeiro_login,
    interesses: userProfile?.interesses
  });
                         
  // Redirecionar para home se for a primeira vez (não mais para onboarding)
  if (needsOnboarding && !isOnboarding) {
    console.log("ProtectedRoute: Usuário precisa completar onboarding inicial", { 
      primeiro_login: userProfile?.primeiro_login,
      interesses: userProfile?.interesses
    });
    return <Navigate to="/" replace />;
  }

  // Se não precisa de onboarding mas não tem empresas, permitir acesso à home
  // O componente NoCompaniesAvailable será mostrado na home
  if (!needsOnboarding && !isOnboarding && (!userCompanies || userCompanies.length === 0) && !companiesLoading) {
    console.log("ProtectedRoute: Usuário sem empresas mas já fez onboarding");
  }

  // Renderiza rotas protegidas se autenticado
  console.log("ProtectedRoute: Usuário autenticado, renderizando rotas protegidas");
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Outlet />
    </ErrorBoundary>
  );
};

// Componente de erro personalizado para ErrorBoundary
const ErrorFallback = (
  <div className="flex flex-col items-center justify-center h-screen p-4">
    <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg max-w-md w-full shadow-md dark:bg-amber-900/30 dark:border-amber-800">
      <div className="flex items-start mb-4">
        <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 mt-1 dark:text-amber-400" />
        <div>
          <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200">Erro na aplicação</h3>
          <p className="text-amber-700 mt-1 dark:text-amber-300">
            Ocorreu um erro ao carregar a aplicação. Isso pode ser devido a problemas de conexão ou permissões.
          </p>
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </Button>
        <Button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          Limpar cache e recarregar
        </Button>
      </div>
    </div>
  </div>
);
