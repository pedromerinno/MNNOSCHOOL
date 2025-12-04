
import { useEffect, useState, memo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { UserHome } from "@/components/home/UserHome";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { Preloader } from "@/components/ui/Preloader";

export const IndexContent = memo(() => {
  const { user, userProfile, loading: authLoading, profileLoading } = useAuth();
  const { selectedCompany, isLoading } = useCompanies();
  const [showPreloader, setShowPreloader] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  // Marcar como montado após o primeiro render para evitar flash do PagePreloader
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Controlar quando parar de mostrar o preloader
  // Removido delay artificial - mostra conteúdo assim que dados essenciais estiverem prontos
  useEffect(() => {
    // Só esconder preloader quando:
    // 1. Auth não está carregando
    // 2. Perfil não está carregando
    // 3. Tem usuário e perfil
    // 4. Empresas não estão carregando (ou já tem empresa selecionada, ou não precisa de empresa)
    const isReady = !authLoading && 
                    !profileLoading && 
                    user && 
                    userProfile && 
                    (!isLoading || selectedCompany);
    
    if (isReady) {
      setShowPreloader(false);
    }
  }, [authLoading, profileLoading, user, userProfile, isLoading, selectedCompany]);

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
    return <Preloader autoHide={false} />;
  }

  // Se não tem usuário, redirecionar para login seria feito pelo ProtectedRoute
  if (!user) {
    console.log("[IndexContent] No user - redirecting should be handled by ProtectedRoute");
    return <Preloader autoHide={false} />;
  }

  // Se tem usuário mas ainda está carregando o perfil, mostrar preloader
  if (!userProfile && profileLoading) {
    console.log("[IndexContent] User exists but profile is loading - showing preloader");
    return <Preloader autoHide={false} />;
  }

  // Se tem usuário mas não tem perfil e não está carregando, ainda mostrar preloader
  // (pode estar criando o perfil ou há um problema)
  if (!userProfile && !profileLoading) {
    console.log("[IndexContent] User exists but no profile and not loading - showing preloader");
    return <Preloader autoHide={false} />;
  }

  // Se tem usuário e perfil, sempre mostrar a home com header
  console.log("[IndexContent] User authenticated - showing UserHome with header");
  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-background pt-16 lg:pt-0">
        <UserHome />
      </div>
    </>
  );
});
IndexContent.displayName = 'IndexContent';
