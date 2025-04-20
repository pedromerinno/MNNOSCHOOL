
import { useCallback, useEffect } from "react";
import { Company } from "@/types/company";
import { useCompanyCache } from "./useCompanyCache";

interface UseSelectedCompanyManagementProps {
  selectedCompany: Company | null;
  userCompanies: Company[];
  getCompanyById: (id: string) => Promise<Company | null>;
  setSelectedCompany: (company: Company | null) => void;
  skipLoadingInOnboarding?: boolean;
}

export const useSelectedCompanyManagement = ({
  selectedCompany,
  userCompanies,
  getCompanyById,
  setSelectedCompany,
  skipLoadingInOnboarding = false
}: UseSelectedCompanyManagementProps) => {
  const { getStoredCompany, getStoredCompanyId } = useCompanyCache();

  const restoreSelectedCompany = useCallback(async () => {
    if (skipLoadingInOnboarding) {
      return;
    }

    if (selectedCompany) return;

    const cachedCompany = getStoredCompany();
    if (cachedCompany) {
      const hasAccess = userCompanies.some(company => company.id === cachedCompany.id);

      if (hasAccess) {
        console.log('[useSelectedCompanyManagement] Restoring cached company:', cachedCompany.nome);
        setSelectedCompany(cachedCompany);
        return;
      } else {
        console.log('[useSelectedCompanyManagement] User has no access to cached company, selecting another');
        localStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompanyId');
      }
    }

    if (userCompanies.length > 0) {
      const storedCompanyId = getStoredCompanyId();

      if (storedCompanyId) {
        const storedCompany = userCompanies.find(company => company.id === storedCompanyId);

        if (storedCompany) {
          setSelectedCompany(storedCompany);
          console.log('[useSelectedCompanyManagement] Company restored from stored ID:', storedCompany.nome);
        } else {
          try {
            const company = await getCompanyById(storedCompanyId);
            if (company && userCompanies.some(c => c.id === company.id)) {
              setSelectedCompany(company);
              console.log('[useSelectedCompanyManagement] Company restored from database:', company.nome);
            } else {
              localStorage.removeItem('selectedCompanyId');
              setSelectedCompany(userCompanies[0]);
              console.log('[useSelectedCompanyManagement] Selecting first available company after failed restore');
            }
          } catch (error) {
            console.error('[useSelectedCompanyManagement] Failed to restore company from localStorage', error);
            localStorage.removeItem('selectedCompanyId');
            
            if (userCompanies.length > 0) {
              setSelectedCompany(userCompanies[0]);
              console.log('[useSelectedCompanyManagement] Selected first company after restore failure');
            }
          }
        }
      } else if (userCompanies.length === 1) {
        setSelectedCompany(userCompanies[0]);
        console.log('[useSelectedCompanyManagement] Auto-selected only available company:', userCompanies[0].nome);
      }
    }
  }, [
    userCompanies,
    selectedCompany,
    getCompanyById,
    getStoredCompanyId,
    getStoredCompany,
    setSelectedCompany,
    skipLoadingInOnboarding
  ]);

  useEffect(() => {
    if (userCompanies.length > 0 && !selectedCompany) {
      restoreSelectedCompany();
    }
  }, [userCompanies.length, selectedCompany, restoreSelectedCompany]);

  return { restoreSelectedCompany };
};
