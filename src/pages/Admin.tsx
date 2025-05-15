
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useSearchParams, useLocation } from 'react-router-dom';
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
  
  const location = useLocation();
  // Utilize useSearchParams para ler o estado da URL
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(
    tabFromUrl || (userProfile?.super_admin ? "platform" : "companies")
  );
  const [isReady, setIsReady] = useState(false);
  const [preventUrlChange, setPreventUrlChange] = useState(false);

  // Use a ref to track initial render
  const isInitialRender = React.useRef(true);

  // Memorizamos a função para atualizar a aba ativa
  const handleTabChange = useCallback((tab: string) => {
    console.log(`Admin tab changed to: ${tab}`);
    setActiveTab(tab);
    
    // Não atualize URL em montagem inicial
    if (!isInitialRender.current) {
      // Flag para prevenir o efeito de atualizar URL novamente
      setPreventUrlChange(true);
      
      // Atualizar URL sem recarregar a página
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('tab', tab);
        return newParams;
      }, { replace: true });
      
      // Restaura flag depois de um curto delay
      setTimeout(() => {
        setPreventUrlChange(false);
      }, 100);
    }
  }, [setSearchParams]);

  // Wait for auth to be ready before rendering
  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
      // Marca que não é mais a montagem inicial
      isInitialRender.current = false;
    }
  }, [authLoading]);

  // Efeito para atualizar o estado quando a URL mudar 
  // (mas não quando nós mudamos a URL programaticamente)
  useEffect(() => {
    // Ignorar mudanças que vieram do nosso próprio código
    if (preventUrlChange) return;
    
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      console.log(`Updating active tab from URL: ${tab}`);
      setActiveTab(tab);
    }
  }, [searchParams, activeTab, preventUrlChange]);

  // Efeito para registrar eventos de histórico para a navegação
  useEffect(() => {
    // Evita atualizar a URL se a mudança veio de uma navegação externa
    if (preventUrlChange) return;
    
    // Adicionamos ao histórico do navegador sem recarregar a página
    const updateUrlWithoutReload = () => {
      if (isInitialRender.current) return;
      
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') !== activeTab) {
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', url.toString());
      }
    };
    
    updateUrlWithoutReload();
  }, [activeTab, preventUrlChange]);

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
