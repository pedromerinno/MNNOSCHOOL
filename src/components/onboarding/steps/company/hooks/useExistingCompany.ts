
import { useState, useEffect, useCallback } from "react";
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";

export function useExistingCompany(companyId: string) {
  const { companyInfo, loading: companyLoading, fetchCompany } = useQuickCompanyLookup();
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  const handleCompanyLookup = useCallback(
    async (_info: any, lookupPending: boolean) => {
      console.log("Lookup company with ID:", companyId, "lookupPending:", lookupPending);
      setShowCompanyInfo(false);
      if (companyId && companyId.length >= 10) {
        const result = await fetchCompany(companyId);
        console.log("Company lookup result:", result);
        setShowCompanyInfo(true);
        return result;
      }
      return null;
    },
    [companyId, fetchCompany]
  );

  useEffect(() => {
    // Reset visible info when ID changes
    setShowCompanyInfo(false);
  }, [companyId]);

  return { companyInfo, companyLoading, showCompanyInfo, setShowCompanyInfo, handleCompanyLookup };
}
