import React from 'react';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard';
import { AdminTabRouter } from '@/components/admin/AdminTabRouter';
import { useRegularAdminTabs } from '@/hooks/admin/useRegularAdminTabs';

/**
 * Página principal do painel administrativo (Admin Regular)
 * Admin regular NUNCA vê a tab "Plataforma", mesmo que seja super admin
 * Refatorada para usar hooks e componentes modulares
 * Otimizado: AdminRouteGuard agora gerencia o preloader internamente
 */
const AdminPage = () => {
  const {
    activeTab,
    handleTabChange,
    isInitialized,
    availableTabs
  } = useRegularAdminTabs();

  // Se não inicializou ainda, AdminRouteGuard mostrará o preloader
  // Isso permite renderização mais rápida sem bloqueios desnecessários
  if (!isInitialized) {
    return (
      <AdminRouteGuard>
        <AdminPageLayout 
          activeTab="dashboard" 
          onTabChange={() => {}} 
          menuItems={[]}
        >
          <div />
        </AdminPageLayout>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard>
      <AdminPageLayout 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        menuItems={availableTabs}
      >
        <AdminTabRouter activeTab={activeTab} />
      </AdminPageLayout>
    </AdminRouteGuard>
  );
};

export default AdminPage;
