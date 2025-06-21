
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { UserHome } from "@/components/home/UserHome";
import { UserHomeSkeleton } from "@/components/home/UserHomeSkeleton";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { QRCodeTester } from "@/components/mobile/QRCodeTester";

export const IndexContent = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { selectedCompany, isLoading } = useCompanies();
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);

  // Controlar quando parar de mostrar o skeleton inicial
  useEffect(() => {
    if (!authLoading && user && userProfile) {
      // Dar um breve momento para carregar os dados iniciais
      const timer = setTimeout(() => {
        setShowInitialSkeleton(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, userProfile]);

  // Debug log para verificar o estado
  useEffect(() => {
    console.log("[IndexContent] Debug state:", {
      user: user?.email,
      userProfile: userProfile?.display_name,
      isSuperAdmin: userProfile?.super_admin,
      selectedCompany: selectedCompany?.nome,
      isLoading,
      authLoading,
      showInitialSkeleton
    });
  }, [user, userProfile, selectedCompany, isLoading, authLoading, showInitialSkeleton]);

  // Mostrar skeleton durante carregamento inicial ou auth loading
  if (showInitialSkeleton || (authLoading && !user)) {
    console.log("[IndexContent] Showing skeleton - initial loading or auth loading");
    return (
      <>
        <MainNavigationMenu />
        <UserHomeSkeleton />
        <QRCodeTester />
      </>
    );
  }

  // Se não tem usuário, redirecionar para login seria feito pelo ProtectedRoute
  if (!user) {
    console.log("[IndexContent] No user - redirecting should be handled by ProtectedRoute");
    return (
      <>
        <MainNavigationMenu />
        <UserHomeSkeleton />
        <QRCodeTester />
      </>
    );
  }

  // Se tem usuário, sempre mostrar a home com header
  console.log("[IndexContent] User authenticated - showing UserHome with header");
  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-background">
        <UserHome />
      </div>
      <QRCodeTester />
    </>
  );
};
