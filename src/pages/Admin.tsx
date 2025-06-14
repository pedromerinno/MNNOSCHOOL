
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { SettingsManagement } from '@/components/admin/integration/SettingsManagement';
import { BackgroundManager } from '@/components/admin/BackgroundManager';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { CompanyNoticesAdminList } from '@/components/admin/CompanyNoticesAdminList';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminPageSkeleton } from '@/components/admin/AdminPageSkeleton';
import { toast } from 'sonner';

const AdminPage = () => {
  const {
    userProfile,
    loading: authLoading
  } = useAuth();
  
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('[Admin] Current state:', {
    activeTab,
    userProfile: userProfile?.email || 'none',
    isAdmin: userProfile?.is_admin,
    isSuperAdmin: userProfile?.super_admin,
    authLoading,
    isInitialized
  });

  // Verificação melhorada de permissões de admin
  const hasAdminAccess = Boolean(userProfile?.is_admin || userProfile?.super_admin);

  // Inicialização mais robusta para evitar flashes
  useEffect(() => {
    // Aguardar até que o auth esteja completo e o userProfile esteja disponível
    if (authLoading || !userProfile) {
      return;
    }
    
    console.log("Admin page - Auth loading complete", { userProfile });
    
    // Verificar se o usuário tem permissões de admin
    if (!hasAdminAccess) {
      console.log("Admin page - No admin access detected");
      return;
    }
    
    // Determinar a aba inicial baseada no perfil do usuário
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    let initialTab = "";
    
    if (tabParam) {
      initialTab = tabParam;
    } else {
      // Definir aba padrão baseada no tipo de usuário
      initialTab = userProfile?.super_admin ? "platform" : "companies";
    }
    
    // Atualizar URL e estado apenas uma vez
    if (initialTab) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', initialTab);
      window.history.replaceState({}, '', newUrl.toString());
      setActiveTab(initialTab);
    }
    
    // Marcar como inicializado para parar de mostrar skeleton
    setIsInitialized(true);
  }, [authLoading, userProfile, hasAdminAccess, location.search]);

  // Manipulador de mudança de aba
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    console.log("Mudando para a aba:", tab);
    
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
        setActiveTab(tabParam);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  // Mostrar skeleton enquanto carrega ou não está inicializado
  if (authLoading || !userProfile || !isInitialized) {
    return <AdminPageSkeleton />;
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
      case "settings":
        return <SettingsManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <div className="container mx-auto px-0 lg:px-4 py-6 max-w-[1500px]">
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full min-h-[calc(100vh-120px)] rounded-lg overflow-hidden">
            <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <ErrorBoundary>
                  {getActiveContent()}
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AdminPage;
