import React from 'react';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { SuperAdminRouteGuard } from '@/components/admin/SuperAdminRouteGuard';
import { AdminTabRouter } from '@/components/admin/AdminTabRouter';
import { useSuperAdminTabs } from '@/hooks/admin/useSuperAdminTabs';

/**
 * Página principal do painel super administrativo
 * Super admin vê TODAS as tabs, incluindo "Plataforma"
 * Refatorada para usar hooks e componentes modulares
 * Otimizado: SuperAdminRouteGuard agora gerencia o preloader internamente
 */
const SuperAdminPage = () => {
  const {
    activeTab,
    handleTabChange,
    isInitialized,
    availableTabs
  } = useSuperAdminTabs();

  // Se não inicializou ainda, SuperAdminRouteGuard mostrará o preloader
  // Isso permite renderização mais rápida sem bloqueios desnecessários
  if (!isInitialized) {
    return (
      <SuperAdminRouteGuard>
        <AdminPageLayout 
          activeTab="dashboard" 
          onTabChange={() => {}} 
          menuItems={[]}
        >
          <div />
        </AdminPageLayout>
      </SuperAdminRouteGuard>
    );
  }

  return (
    <SuperAdminRouteGuard>
      <AdminPageLayout 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        menuItems={availableTabs}
      >
        <AdminTabRouter activeTab={activeTab} />
      </AdminPageLayout>
    </SuperAdminRouteGuard>
  );
};

export default SuperAdminPage;

