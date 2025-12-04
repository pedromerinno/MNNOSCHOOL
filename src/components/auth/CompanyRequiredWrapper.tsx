
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PagePreloader } from "@/components/ui/PagePreloader";

interface CompanyRequiredWrapperProps {
  children: ReactNode;
}

export const CompanyRequiredWrapper = ({ children }: CompanyRequiredWrapperProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("[CompanyRequiredWrapper] Current state:", {
    user: user ? { email: user.email } : undefined,
    loading,
    pathname: location.pathname
  });

  // Se está carregando auth, mostrar preloader
  // Exceto na rota "/" onde o IndexContent já cuida do loading
  if (loading && location.pathname !== "/") {
    console.log("[CompanyRequiredWrapper] Loading auth - showing preloader");
    return <PagePreloader />;
  }

  // Na rota "/", não mostrar nada durante loading - IndexContent cuida disso
  if (loading && location.pathname === "/") {
    console.log("[CompanyRequiredWrapper] Loading auth on home - letting IndexContent handle it");
    return <>{children}</>;
  }

  // Se não tem usuário, redirecionar para login
  if (!user) {
    console.log("[CompanyRequiredWrapper] No user - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Se tem usuário, sempre permitir acesso - sem verificações complicadas
  console.log("[CompanyRequiredWrapper] User authenticated - allowing access");
  return <>{children}</>;
};
