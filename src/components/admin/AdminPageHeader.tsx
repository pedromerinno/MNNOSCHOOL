import React from 'react';
import { AdminTabId } from '@/types/admin';
import { getAdminTabConfig } from '@/config/adminTabsConfig';
import { AdminPageTitle } from './AdminPageTitle';

interface AdminPageHeaderProps {
  activeTab: AdminTabId;
  actions?: React.ReactNode;
  /**
   * Permite sobrescrever o título
   */
  title?: string;
  /**
   * Permite sobrescrever a descrição
   */
  description?: string;
  /**
   * Tamanho do título
   */
  size?: 'lg' | 'xl';
}

/**
 * Componente de cabeçalho padronizado para páginas admin
 * Exibe o título e descrição baseado na tab ativa
 * Usa AdminPageTitle internamente para manter consistência
 */
export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ 
  activeTab, 
  actions,
  title,
  description,
  size = 'xl'
}) => {
  const config = getAdminTabConfig(activeTab);

  if (!config) return null;

  const finalTitle = title || config.title;
  const finalDescription = description || config.description;

  return (
    <AdminPageTitle
      title={finalTitle}
      description={finalDescription}
      size={size}
      actions={actions}
    />
  );
};

