
import { useEffect } from "react";

export const useInitialCompanyLoad = (
  user: any,
  userCompanies: any[],
  isLoading: boolean,
  hasAttemptedForceLoad: React.MutableRefObject<boolean>,
  getUserCompanies: (userId: string, forceRefresh?: boolean) => Promise<any[]>
) => {
  // Force initial company load
  useEffect(() => {
    if (user?.id && userCompanies.length === 0 && !isLoading && !hasAttemptedForceLoad.current) {
      console.log("[Index] Forçando carregamento inicial de empresas");
      hasAttemptedForceLoad.current = true;
      getUserCompanies(user.id, true).catch(err => {
        console.error("[Index] Erro no carregamento inicial:", err);
      });
    }
  }, [user?.id, getUserCompanies, userCompanies.length, isLoading, hasAttemptedForceLoad]);
};
