
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
import { toast } from 'sonner';

const AdminPage = () => {
  const {
    userProfile,
    loading: authLoading
  } = useAuth();
  
  const location = useLocation();
  
  // Initialize with the appropriate default tab based on user role
  const [activeTab, setActiveTab] = useState(userProfile?.super_admin ? "platform" : "companies");
  const [isReady, setIsReady] = useState(false);

  // Inicialização melhorada para evitar recarregamentos
  useEffect(() => {
    if (!authLoading) {
      console.log("Admin page - Auth loading complete", { userProfile });
      
      // Verificar se o usuário tem permissões de admin
      if (!userProfile?.is_admin && !userProfile?.super_admin) {
        toast.error("Você não tem permissões de administrador");
        return;
      }
      
      // Lógica para determinar a aba inicial
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      
      // Definir a aba ativa sem navegação
      if (tabParam) {
        setActiveTab(tabParam);
      } else {
        // Se não houver parâmetro, use o padrão
        const defaultTab = userProfile?.super_admin ? "platform" : "companies";
        
        // Atualiza a URL sem causar navegação
        if (defaultTab) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('tab', defaultTab);
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
      
      setIsReady(true);
    }
  }, [authLoading, location.search, userProfile]);

  // Manipulador de mudança de aba otimizado para evitar recarregamentos
  const handleTabChange = useCallback((tab: string) => {
    // Atualiza o estado diretamente
    setActiveTab(tab);
    console.log("Mudando para a aba:", tab);
  }, []);

  // Lidar com navegação do histórico
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (authLoading || !isReady) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Log detalhado para debugging
  console.log("Admin page - Auth check", { 
    is_admin: userProfile?.is_admin, 
    super_admin: userProfile?.super_admin,
    hasAccess: Boolean(userProfile?.is_admin || userProfile?.super_admin)
  });

  if (!userProfile?.is_admin && !userProfile?.super_admin) {
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

  return <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
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
    </div>;
};

export default AdminPage;
