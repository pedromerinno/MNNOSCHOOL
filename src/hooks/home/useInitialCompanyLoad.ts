
import { useEffect } from "react";

export const useInitialCompanyLoad = (
  user: any,
  userCompanies: any[],
  isLoading: boolean,
  hasAttemptedForceLoad: React.MutableRefObject<boolean>,
  getUserCompanies: (userId: string, forceRefresh?: boolean) => Promise<any[]>
) => {
  // Force initial company load - only once
  useEffect(() => {
    const loadCompanies = async () => {
      if (user?.id && userCompanies.length === 0 && !isLoading && !hasAttemptedForceLoad.current) {
        console.log("[useInitialCompanyLoad] Forçando carregamento inicial de empresas");
        hasAttemptedForceLoad.current = true;
        try {
          await getUserCompanies(user.id, true);
        } catch (err) {
          console.error("[useInitialCompanyLoad] Erro no carregamento inicial:", err);
        }
      }
    };
    
    loadCompanies();
  }, [user?.id, getUserCompanies, userCompanies.length, isLoading, hasAttemptedForceLoad]);
};
