
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
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If logged in but needs to complete onboarding
  if (!userProfile.displayName && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  
  // User is logged in and has completed onboarding
  return <Outlet />;
};
