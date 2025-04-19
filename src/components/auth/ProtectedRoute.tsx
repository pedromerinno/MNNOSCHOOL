
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Este efeito garante que não ficaremos presos em um estado de carregamento infinito
  useEffect(() => {
    console.log("ProtectedRoute: Verificando autenticação");
    
    // Definir um tempo limite para o carregamento da autenticação
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("ProtectedRoute: Tempo limite de carregamento atingido");
        setInitialLoadDone(true);
        setAuthError("Tempo limite de autenticação excedido. Tente novamente ou faça login novamente.");
      }
    }, 3000);
    
    // Se o carregamento for concluído, marque como concluído
    if (!loading) {
      console.log("ProtectedRoute: Carregamento concluído");
      setInitialLoadDone(true);
      clearTimeout(timeoutId);
    }
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Use o estado local para controlar o estado de carregamento
  if (loading && !initialLoadDone) {
    console.log("ProtectedRoute: Mostrando estado de carregamento");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-merinno-dark"></div>
        <p className="ml-2">Carregando...</p>
      </div>
    );
  }

  // Se tivermos um erro de autenticação, mostramos a mensagem de erro
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg max-w-md w-full shadow-md">
          <div className="flex items-start mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-amber-800">Problema de autenticação</h3>
              <p className="text-amber-700 mt-1">{authError}</p>
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

  // Se não estiver autenticado, redirecione para o login
  if (!user) {
    console.log("ProtectedRoute: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Renderizar rotas filhas se autenticado
  console.log("ProtectedRoute: Usuário autenticado, renderizando rotas protegidas");
  return <Outlet />;
};
