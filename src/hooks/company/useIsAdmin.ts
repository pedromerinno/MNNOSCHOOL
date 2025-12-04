import { useAuth } from "@/contexts/AuthContext";
import { useUserCompanyAdmin } from "./useUserCompanyAdmin";
import { useMemo } from "react";

/**
 * Hook para verificar se o usuário atual é admin
 * Considera super_admin (global) e is_admin da empresa selecionada
 * Otimizado para retornar imediatamente se for super admin
 */
export const useIsAdmin = () => {
  const { userProfile, profileLoading } = useAuth();
  const { isAdmin: isCompanyAdmin, isLoading: isCompanyAdminLoading } = useUserCompanyAdmin();
  
  // Super admin tem acesso global - verificar primeiro sem aguardar queries
  // Mas só considerar true se o perfil já carregou completamente
  const isSuperAdmin = useMemo(() => {
    // Não considerar enquanto o perfil está carregando
    if (profileLoading) return false;
    // Só considerar se temos perfil carregado
    if (!userProfile) return false;
    return userProfile.super_admin === true;
  }, [userProfile?.super_admin, profileLoading, userProfile]);
  
  // Admin da empresa selecionada ou super admin
  // Mas só considerar true se não estiver carregando e tiver perfil
  // IMPORTANTE: Só considerar isCompanyAdmin como true se isLoading for false
  const isAdmin = useMemo(() => {
    // Não considerar enquanto o perfil está carregando
    if (profileLoading) return false;
    // Só considerar se temos perfil carregado
    if (!userProfile) return false;
    // Se ainda está carregando verificação de admin da empresa, NUNCA considerar admin
    // Mesmo que isCompanyAdmin seja true (pode ser do cache ou estado anterior)
    if (isCompanyAdminLoading) return isSuperAdmin; // Só super admin pode ser true enquanto carrega
    // Só agora considerar isCompanyAdmin, pois a verificação está completa
    return isSuperAdmin || isCompanyAdmin;
  }, [isSuperAdmin, isCompanyAdmin, profileLoading, userProfile, isCompanyAdminLoading]);
  
  // Se é super admin confirmado, não precisa aguardar loading da empresa
  // Se ainda está carregando o perfil, aguardar
  // Se ainda está carregando verificação de admin da empresa, aguardar
  const isLoading = useMemo(() => {
    // Se ainda está carregando o perfil, está carregando
    if (profileLoading) return true;
    // Se não temos perfil ainda, está carregando
    if (!userProfile) return true;
    // Se é super admin confirmado, não precisa aguardar loading da empresa
    if (isSuperAdmin) return false;
    // Caso contrário, aguardar verificação de admin da empresa
    return isCompanyAdminLoading;
  }, [isSuperAdmin, profileLoading, userProfile, isCompanyAdminLoading]);
  
  return {
    isAdmin,
    isSuperAdmin,
    isCompanyAdmin,
    isLoading
  };
};

