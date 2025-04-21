
import { useState, useEffect, useCallback } from "react";
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";

export function useExistingCompany(companyId: string) {
  const { companyInfo, loading: companyLoading, fetchCompany } = useQuickCompanyLookup();
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  const handleCompanyLookup = useCallback(
    async (_info: any, _lookupPending: boolean) => {
      setShowCompanyInfo(false);
      if (companyId && companyId.length >= 10) {
        await fetchCompany(companyId);
        setShowCompanyInfo(true);
      }
    },
    [companyId, fetchCompany]
  );

  useEffect(() => {
    // Reset visible info when ID changes
    setShowCompanyInfo(false);
  }, [companyId]);

  return { companyInfo, companyLoading, showCompanyInfo, setShowCompanyInfo, handleCompanyLookup };
}
