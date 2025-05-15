
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { UserManagement } from '@/components/admin/UserManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { SettingsManagement } from '@/components/admin/integration/SettingsManagement';
import { BackgroundManager } from '@/components/admin/BackgroundManager';
import { useAuth } from '@/contexts/AuthContext';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { CompanyNoticesAdminList } from '@/components/admin/CompanyNoticesAdminList';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const AdminPage = () => {
  const {
    userProfile,
    loading: authLoading
  } = useAuth();
  
  // Utilize useSearchParams para ler o estado da URL
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(
    tabFromUrl || (userProfile?.super_admin ? "platform" : "companies")
  );
  const [isReady, setIsReady] = useState(false);

  // Memorizamos a função para atualizar a aba ativa
  const handleTabChange = useCallback((tab: string) => {
    console.log(`Admin tab changed to: ${tab}`);
    setActiveTab(tab);
  }, []);

  // Wait for auth to be ready before rendering
  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
    }
  }, [authLoading]);

  // Efeito para registrar eventos de histórico para a navegação
  useEffect(() => {
    // Adicionamos ao histórico do navegador sem recarregar a página
    const updateUrlWithoutReload = () => {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    };
    
    updateUrlWithoutReload();
  }, [activeTab]);

  if (!isReady) {
    return <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>;
  }

  if (!userProfile?.is_admin && !userProfile?.super_admin) {
    return <Navigate to="/" replace />;
  }

  // Content selector based on active tab
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
