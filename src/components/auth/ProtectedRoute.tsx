
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Simplified auth check - only check once
  useEffect(() => {
    if (!loading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
    }
  }, [loading, hasCheckedAuth]);

  // Show loading only during initial auth check
  if (loading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected routes if authenticated
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
