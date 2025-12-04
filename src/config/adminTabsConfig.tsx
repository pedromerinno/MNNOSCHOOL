import React from 'react';
import { 
  LayoutDashboard,
  Globe,
  Building2, 
  Users2, 
  GraduationCap, 
  BookMarked,
  MessageSquareMore, 
  Settings2,
  BriefcaseBusiness,
  KeyRound,
  FileText
} from 'lucide-react';
import { AdminTabConfig, AdminTabId } from '@/types/admin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { BackgroundManager } from '@/components/admin/BackgroundManager';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { SuggestedCoursesManagement } from '@/components/admin/integration/suggested-courses/SuggestedCoursesManagement';
import { CompanyNoticesAdminList } from '@/components/admin/CompanyNoticesAdminList';
import { SettingsManagement } from '@/components/admin/integration/SettingsManagement';
import { CompanyJobRolesPage } from '@/components/admin/CompanyJobRolesPage';
import { CompanyAccessPage } from '@/components/admin/CompanyAccessPage';
import { CompanyDocumentsManagement } from '@/components/admin/CompanyDocumentsManagement';

/**
 * Configuração centralizada de todas as tabs do admin
 * Define a ordem, ícones, componentes e permissões necessárias
 */
export const adminTabsConfig: AdminTabConfig[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    component: AdminDashboard,
    description: 'Visão geral das estatísticas'
  },
  {
    id: 'platform',
    title: 'Plataforma',
    icon: Globe,
    component: BackgroundManager,
    requiresSuperAdmin: true,
    description: 'Configurações da plataforma'
  },
  {
    id: 'companies',
    title: 'Empresas',
    icon: Building2,
    component: CompanyManagement,
    description: 'Gerenciar empresas'
  },
  {
    id: 'users',
    title: 'Usuários',
    icon: Users2,
    component: UserManagement,
    description: 'Gerenciar usuários'
  },
  {
    id: 'allcourses',
    title: 'Todos os Cursos',
    icon: GraduationCap,
    component: CourseManagement,
    description: 'Gerenciar cursos'
  },
  {
    id: 'suggested-courses',
    title: 'Sugestões de Cursos',
    icon: BookMarked,
    component: SuggestedCoursesManagement,
    description: 'Cursos sugeridos para usuários'
  },
  {
    id: 'notices',
    title: 'Avisos',
    icon: MessageSquareMore,
    component: CompanyNoticesAdminList,
    description: 'Gerenciar avisos'
  },
  {
    id: 'job-roles',
    title: 'Cargos',
    icon: BriefcaseBusiness,
    component: CompanyJobRolesPage,
    description: 'Gerenciar cargos da empresa'
  },
  {
    id: 'access',
    title: 'Senhas e Acessos',
    icon: KeyRound,
    component: CompanyAccessPage,
    description: 'Gerenciar senhas e acessos da empresa'
  },
  {
    id: 'documents',
    title: 'Documentos',
    icon: FileText,
    component: CompanyDocumentsManagement,
    description: 'Gerenciar documentos da empresa'
  },
  {
    id: 'settings',
    title: 'Configurações',
    icon: Settings2,
    component: SettingsManagement,
    description: 'Configurações de integração'
  }
];

/**
 * Obtém a configuração de uma tab específica
 */
export const getAdminTabConfig = (tabId: AdminTabId): AdminTabConfig | undefined => {
  return adminTabsConfig.find(tab => tab.id === tabId);
};

/**
 * Obtém a primeira tab disponível para o usuário (baseado em permissões)
 */
export const getDefaultAdminTab = (isSuperAdmin: boolean): AdminTabId => {
  return 'dashboard';
};

/**
 * Filtra tabs baseado nas permissões do usuário
 */
export const getAvailableAdminTabs = (isSuperAdmin: boolean): AdminTabConfig[] => {
  return adminTabsConfig.filter(tab => {
    if (tab.requiresSuperAdmin && !isSuperAdmin) {
      return false;
    }
    return true;
  });
};

/**
 * Obtém tabs disponíveis para admin regular (sem Plataforma e sem Empresas)
 * Mesmo super admins não veem Plataforma e Empresas na página de admin regular
 */
export const getRegularAdminTabs = (): AdminTabConfig[] => {
  return adminTabsConfig.filter(tab => tab.id !== 'platform' && tab.id !== 'companies');
};

/**
 * Obtém tabs disponíveis para super admin (incluindo Plataforma)
 * Apenas para a página de super admin
 */
export const getSuperAdminTabs = (): AdminTabConfig[] => {
  return adminTabsConfig; // Todas as tabs, incluindo Plataforma
};

/**
 * Valida se uma tab existe e está disponível para o usuário
 */
export const isValidAdminTab = (tabId: string, isSuperAdmin: boolean): tabId is AdminTabId => {
  const config = getAdminTabConfig(tabId as AdminTabId);
  if (!config) return false;
  if (config.requiresSuperAdmin && !isSuperAdmin) return false;
  return true;
};

/**
 * Valida se uma tab é válida para admin regular (exclui Plataforma e Empresas)
 */
export const isValidRegularAdminTab = (tabId: string): tabId is AdminTabId => {
  if (tabId === 'platform') return false; // Plataforma nunca disponível para admin regular
  if (tabId === 'companies') return false; // Empresas nunca disponível para admin regular
  const config = getAdminTabConfig(tabId as AdminTabId);
  return config !== undefined;
};

/**
 * Valida se uma tab é válida para super admin (inclui todas)
 */
export const isValidSuperAdminTab = (tabId: string): tabId is AdminTabId => {
  const config = getAdminTabConfig(tabId as AdminTabId);
  return config !== undefined;
};

