import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/company/useIsAdmin';
import { PagePreloader } from '@/components/ui/PagePreloader';
import { MainNavigationMenu } from '@/components/navigation/MainNavigationMenu';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Componente de proteção de rota para páginas admin
 * Verifica permissões e exibe estados de carregamento apropriados
 * Otimizado: removido timer desnecessário que causava lentidão
 * Atualizado: usa useIsAdmin que verifica corretamente admin da empresa selecionada
 */
export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const {
    user,
    userProfile,
    loading: authLoading
  } = useAuth();

  // Usar hook que verifica corretamente admin (super_admin ou is_admin da empresa)
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Se não tem usuário, mostrar preloader (redirecionamento seria feito pelo ProtectedRoute)
  if (!user || authLoading) {
    return <PagePreloader />;
  }

  // Mostrar preloader enquanto carrega perfil ou verifica admin
  if (!userProfile || isAdminLoading) {
    return <PagePreloader />;
  }

  // Verificar acesso após carregamento completo
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

