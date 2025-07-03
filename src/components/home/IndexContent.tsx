
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { UserHome } from "@/components/home/UserHome";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { Preloader } from "@/components/ui/Preloader";

export const IndexContent = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { selectedCompany, isLoading } = useCompanies();
  const [showPreloader, setShowPreloader] = useState(true);

  // Controlar quando parar de mostrar o preloader
  useEffect(() => {
    if (!authLoading && user && userProfile) {
      // Dar um breve momento para carregar os dados iniciais
      const timer = setTimeout(() => {
        setShowPreloader(false);
      }, 1500);
      
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
      showPreloader
    });
  }, [user, userProfile, selectedCompany, isLoading, authLoading, showPreloader]);

  // Mostrar preloader durante carregamento inicial ou auth loading
  if (showPreloader || (authLoading && !user)) {
    console.log("[IndexContent] Showing preloader - initial loading or auth loading");
    return (
      <Preloader>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Carregando...
        </p>
      </Preloader>
    );
  }

  // Se não tem usuário, redirecionar para login seria feito pelo ProtectedRoute
  if (!user) {
    console.log("[IndexContent] No user - redirecting should be handled by ProtectedRoute");
    return (
      <Preloader>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Redirecionando...
        </p>
      </Preloader>
    );
  }

  // Se tem usuário, sempre mostrar a home com header
  console.log("[IndexContent] User authenticated - showing UserHome with header");
  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-background pt-16 lg:pt-0">
        <UserHome />
      </div>
    </>
  );
};
