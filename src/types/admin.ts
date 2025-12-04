import { LucideIcon } from 'lucide-react';
import { ComponentType } from 'react';

/**
 * Tipo para identificar uma tab do admin
 */
export type AdminTabId = 
  | 'dashboard'
  | 'platform'
  | 'companies'
  | 'users'
  | 'allcourses'
  | 'suggested-courses'
  | 'notices'
  | 'settings'
  | 'job-roles'
  | 'access'
  | 'documents';

/**
 * Configuração de uma tab do admin
 */
export interface AdminTabConfig {
  id: AdminTabId;
  title: string;
  icon: LucideIcon;
  component: ComponentType<any>;
  requiresSuperAdmin?: boolean;
  description?: string;
}

/**
 * Props para componentes de conteúdo admin
 */
export interface AdminContentProps {
  activeTab: AdminTabId;
  onTabChange?: (tab: AdminTabId) => void;
}

