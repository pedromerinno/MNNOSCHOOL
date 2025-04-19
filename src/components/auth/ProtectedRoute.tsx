
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

export const ProtectedRoute = () => {
  const { user, loading, session } = useAuth();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Ensure we don't get stuck in an infinite loading state
  useEffect(() => {
    console.log("ProtectedRoute: Verificando autenticação");
    
    // Set a timeout for authentication loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("ProtectedRoute: Tempo limite de carregamento atingido");
        setInitialLoadDone(true);
        setAuthError("Tempo limite de autenticação excedido. Tente novamente ou faça login novamente.");
      }
    }, 5000);
    
    // If loading is completed, mark as done
    if (!loading) {
      console.log("ProtectedRoute: Carregamento concluído");
      setInitialLoadDone(true);
      clearTimeout(timeoutId);
    }
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Add additional check for token validation
  useEffect(() => {
    // Check if token is valid
    if (session && !loading) {
      console.log("ProtectedRoute: Sessão verificada com sucesso");
      
      // Clear any previous auth errors if we have a valid session
      if (authError) {
        setAuthError(null);
      }
    } else if (!loading && initialLoadDone && !user) {
      console.log("ProtectedRoute: Usuário não autenticado após carregamento");
    }
  }, [session, loading, initialLoadDone, user, authError]);

  // Custom error component for ErrorBoundary
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

  // Show loading state
  if (loading && !initialLoadDone) {
    console.log("ProtectedRoute: Mostrando estado de carregamento");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2">Carregando...</p>
      </div>
    );
  }

  // Show auth error if we have one
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
              onClick={() => window.location.href = '/login'}
            >
              Ir para login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log("ProtectedRoute: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Render protected routes if authenticated, wrapped in ErrorBoundary
  console.log("ProtectedRoute: Usuário autenticado, renderizando rotas protegidas");
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Outlet />
    </ErrorBoundary>
  );
};
