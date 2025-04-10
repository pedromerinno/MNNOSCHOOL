
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = () => {
  const { user, loading, userProfile } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-merinno-dark" />
      </div>
    );
  }
  
  // Se não estiver logado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Se estiver logado mas precisa completar onboarding
  if (!userProfile?.displayName && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Usuário está logado e completou onboarding
  return <Outlet />;
};
