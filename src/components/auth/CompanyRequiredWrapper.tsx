
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { IndexSkeleton } from "@/components/home/IndexSkeleton";

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

  // Se está carregando auth, mostrar skeleton
  if (loading) {
    console.log("[CompanyRequiredWrapper] Loading auth - showing skeleton");
    return <IndexSkeleton />;
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
