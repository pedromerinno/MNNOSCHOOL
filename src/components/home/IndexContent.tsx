
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { UserHome } from "@/components/home/UserHome";
import { IndexSkeleton } from "@/components/home/IndexSkeleton";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";

export const IndexContent = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { selectedCompany, isLoading } = useCompanies();

  // Debug log para verificar o estado
  useEffect(() => {
    console.log("[IndexContent] Debug state:", {
      user: user?.email,
      userProfile: userProfile?.display_name,
      isSuperAdmin: userProfile?.super_admin,
      selectedCompany: selectedCompany?.nome,
      isLoading,
      authLoading
    });
  }, [user, userProfile, selectedCompany, isLoading, authLoading]);

  // Mostrar skeleton apenas se ainda está carregando auth E não tem usuário
  if (authLoading && !user) {
    console.log("[IndexContent] Showing skeleton - auth loading and no user");
    return <IndexSkeleton />;
  }

  // Se não tem usuário, redirecionar para login seria feito pelo ProtectedRoute
  if (!user) {
    console.log("[IndexContent] No user - redirecting should be handled by ProtectedRoute");
    return <IndexSkeleton />;
  }

  // Se tem usuário, sempre mostrar a home com header
  console.log("[IndexContent] User authenticated - showing UserHome with header");
  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-background">
        <UserHome />
      </div>
    </>
  );
};
