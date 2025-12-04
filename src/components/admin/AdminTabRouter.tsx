import React, { useMemo } from 'react';
import { AdminTabId } from '@/types/admin';
import { getAdminTabConfig } from '@/config/adminTabsConfig';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

interface AdminTabRouterProps {
  activeTab: AdminTabId;
}

/**
 * Componente responsável por renderizar o conteúdo correto baseado na tab ativa
 * Usa a configuração centralizada de tabs para mapear tab -> componente
 */
export const AdminTabRouter: React.FC<AdminTabRouterProps> = ({ activeTab }) => {
  const config = useMemo(() => {
    return getAdminTabConfig(activeTab);
  }, [activeTab]);

  if (!config) {
    console.warn(`Tab "${activeTab}" não encontrada na configuração, usando dashboard`);
    return <AdminDashboard />;
  }

  const Component = config.component;

  return <Component />;
};

