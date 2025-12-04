import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PagePreloader } from '@/components/ui/PagePreloader';
import { MainNavigationMenu } from '@/components/navigation/MainNavigationMenu';

interface SuperAdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Componente de proteção de rota para páginas super admin
 * Verifica se o usuário é super admin e exibe estados de carregamento apropriados
 */
export const SuperAdminRouteGuard: React.FC<SuperAdminRouteGuardProps> = ({ children }) => {
  const {
    user,
    userProfile,
    loading: authLoading
  } = useAuth();

  // Verificação de permissões de super admin
  const isSuperAdmin = Boolean(userProfile?.super_admin);

  // Se não tem usuário, mostrar preloader (redirecionamento seria feito pelo ProtectedRoute)
  if (!user || authLoading) {
    return <PagePreloader />;
  }

  // Mostrar preloader enquanto carrega perfil
  if (!userProfile) {
    return <PagePreloader />;
  }

  // Verificar acesso após carregamento completo - apenas super admin
  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

