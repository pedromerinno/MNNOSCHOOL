
import { useCallback } from "react";
import { Company } from "@/types/company";

interface UseCompanyEventHandlersProps {
  user?: { id: string } | null;
  forceGetUserCompanies: (userId: string) => Promise<Company[]>;
  fetchCompanies: () => Promise<void>;
}

export const useCompanyEventHandlers = ({
  user,
  forceGetUserCompanies,
  fetchCompanies
}: UseCompanyEventHandlersProps) => {
  const handleCompanyRelationChange = useCallback(async () => {
    if (user?.id) {
      try {
        console.log('[useCompanyEventHandlers] Forcing update after company relation change');
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error('[useCompanyEventHandlers] Error updating companies:', error);
      }
    }
  }, [user?.id, forceGetUserCompanies]);

  const handleForceReload = useCallback(async () => {
    if (user?.id) {
      try {
        console.log('[useCompanyEventHandlers] Force reloading user companies');
        await forceGetUserCompanies(user.id);
      } catch (error) {
        console.error('[useCompanyEventHandlers] Error force reloading:', error);
      }
    } else {
      try {
        console.log('[useCompanyEventHandlers] Force reloading all companies');
        await fetchCompanies();
      } catch (error) {
        console.error('[useCompanyEventHandlers] Error reloading all companies:', error);
      }
    }
  }, [user?.id, forceGetUserCompanies, fetchCompanies]);

  return {
    handleCompanyRelationChange,
    handleForceReload
  };
};
