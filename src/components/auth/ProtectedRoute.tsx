
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Este efeito garante que não ficaremos presos em um estado de carregamento infinito
  useEffect(() => {
    console.log("ProtectedRoute: Verificando autenticação");
    
    // Definir um tempo limite para o carregamento da autenticação
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("ProtectedRoute: Tempo limite de carregamento atingido");
        setInitialLoadDone(true);
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

  // Se não estiver autenticado, redirecione para o login
  if (!user) {
    console.log("ProtectedRoute: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Renderizar rotas filhas se autenticado
  console.log("ProtectedRoute: Usuário autenticado, renderizando rotas protegidas");
  return <Outlet />;
};
