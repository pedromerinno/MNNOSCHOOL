
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { SettingsManagement } from '@/components/admin/integration/SettingsManagement';
import { BackgroundManager } from '@/components/admin/BackgroundManager';
import { SuggestedCoursesManagement } from '@/components/admin/integration/suggested-courses/SuggestedCoursesManagement';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { CompanyNoticesAdminList } from '@/components/admin/CompanyNoticesAdminList';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminPageSkeleton } from '@/components/admin/AdminPageSkeleton';
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { Preloader } from "@/components/ui/Preloader";
import { toast } from 'sonner';

const AdminPage = () => {
  const {
    user,
    userProfile,
    loading: authLoading
  } = useAuth();
  
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  // Verificação melhorada de permissões de admin
  const hasAdminAccess = Boolean(userProfile?.is_admin || userProfile?.super_admin);

  // Controlar quando parar de mostrar o preloader - igual à IndexContent
  useEffect(() => {
    if (!authLoading && user && userProfile) {
      // Dar um breve momento para carregar os dados iniciais
      const timer = setTimeout(() => {
        setShowPreloader(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, userProfile]);

  // Inicialização ÚNICA das abas - só executa uma vez quando o componente monta
  useEffect(() => {
    // Aguardar até que o auth esteja completo e o userProfile esteja disponível
    if (authLoading || !userProfile || isInitialized) {
      return;
    }
    
    console.log("Admin page - Initializing tabs for the first time", { userProfile });
    
    // Verificar se o usuário tem permissões de admin
    if (!hasAdminAccess) {
      console.log("Admin page - No admin access detected");
      return;
    }
    
    // Determinar a aba inicial baseada na URL ou perfil do usuário
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    let initialTab = "";
    
    if (tabParam) {
      initialTab = tabParam;
    } else {
      // Definir aba padrão baseada no tipo de usuário APENAS se não há parâmetro na URL
      initialTab = userProfile?.super_admin ? "platform" : "companies";
    }
    
    // Atualizar URL e estado apenas na inicialização
    if (initialTab) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', initialTab);
      window.history.replaceState({}, '', newUrl.toString());
      setActiveTab(initialTab);
    }
    
    // Marcar como inicializado para NÃO executar novamente
    setIsInitialized(true);
    console.log("Admin page - Initialization complete with tab:", initialTab);
  }, [authLoading, userProfile, hasAdminAccess, isInitialized, location.search]);

  // Manipulador de mudança de aba - NÃO deve interferir com a inicialização
  const handleTabChange = useCallback((tab: string) => {
    console.log("Admin page - User changing tab to:", tab);
    setActiveTab(tab);
    
    // Atualizar URL sem causar recarregamento
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', tab);
    window.history.replaceState({}, '', newUrl.toString());
  }, []);

  // Lidar com navegação do histórico
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && tabParam !== activeTab) {
        console.log("Admin page - Browser navigation detected, changing to:", tabParam);
        setActiveTab(tabParam);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  console.log('[Admin] Current state:', {
    activeTab,
    user: user?.email,
    userProfile: userProfile?.email || 'none',
    isAdmin: userProfile?.is_admin,
    isSuperAdmin: userProfile?.super_admin,
    authLoading,
    isInitialized,
    showPreloader
  });

  // Mostrar preloader durante carregamento inicial ou auth loading - igual à IndexContent
  if (showPreloader || (authLoading && !user)) {
    console.log("[Admin] Showing preloader - initial loading or auth loading");
    return <Preloader />;
  }

  // Se não tem usuário, redirecionar para login seria feito pelo ProtectedRoute
  if (!user) {
    console.log("[Admin] No user - redirecting should be handled by ProtectedRoute");
    return <Preloader />;
  }

  // Mostrar skeleton enquanto carrega ou não está inicializado
  if (authLoading || !userProfile || !isInitialized) {
    return (
      <>
        <MainNavigationMenu />
        <AdminPageSkeleton />
      </>
    );
  }

  // Verificar acesso após carregamento completo
  if (!hasAdminAccess) {
    console.log("Admin page - Access denied, redirecting to home");
    return <Navigate to="/" replace />;
  }

  const getActiveContent = () => {
    switch (activeTab) {
      case "platform":
        return <BackgroundManager />;
      case "companies":
        return <CompanyManagement />;
      case "users":
        return <UserManagement />;
      case "allcourses":
        return <CourseManagement />;
      case "notices":
        return <CompanyNoticesAdminList />;
      case "suggested-courses":
        return <SuggestedCoursesManagement />;
      case "settings":
        return <SettingsManagement />;
      default:
        return null;
    }
  };

  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
        <div className="container mx-auto px-0 lg:px-4 py-6 max-w-[1500px]">
          <SidebarProvider defaultOpen={true}>
            <div className="flex w-full min-h-[calc(100vh-120px)]">
              <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
              <div className="flex-1 bg-transparent">
                <div className="p-6 h-full">
                  <ErrorBoundary>
                    {getActiveContent()}
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
