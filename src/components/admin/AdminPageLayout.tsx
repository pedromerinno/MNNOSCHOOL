import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from './AdminSidebar';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { AdminTabId, AdminTabConfig } from '@/types/admin';

interface AdminPageLayoutProps {
  activeTab: AdminTabId;
  onTabChange: (tab: AdminTabId) => void;
  menuItems: AdminTabConfig[];
  children: React.ReactNode;
}

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  activeTab,
  onTabChange,
  menuItems,
  children
}) => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col">
      <MainNavigationMenu />
      <div className="flex-1 flex overflow-hidden">
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full h-full">
            <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} menuItems={menuItems} />
            <SidebarInset className="flex-1 bg-background min-h-0 overflow-y-auto !m-4 lg:!m-8 p-4 lg:p-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

/**
 * Componente wrapper padrão para conteúdo de páginas admin
 * Fornece um container consistente com espaçamento e estilo padronizados
 */
export const AdminPageContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {children}
    </div>
  );
};

