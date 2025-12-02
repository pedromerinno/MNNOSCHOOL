import { useAuth } from "@/contexts/AuthContext";
import { useUserCompanyAdmin } from "./useUserCompanyAdmin";

/**
 * Hook para verificar se o usuário atual é admin
 * Considera super_admin (global) e is_admin da empresa selecionada
 */
export const useIsAdmin = () => {
  const { userProfile } = useAuth();
  const { isAdmin: isCompanyAdmin } = useUserCompanyAdmin();
  
  // Super admin tem acesso global
  const isSuperAdmin = userProfile?.super_admin === true;
  
  // Admin da empresa selecionada ou super admin
  const isAdmin = isSuperAdmin || isCompanyAdmin;
  
  return {
    isAdmin,
    isSuperAdmin,
    isCompanyAdmin
  };
};

