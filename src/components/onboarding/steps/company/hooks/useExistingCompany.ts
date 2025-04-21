
import { useState, useEffect, useCallback } from "react";
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";

export function useExistingCompany(companyId: string) {
  const { companyInfo, loading: companyLoading, fetchCompany } = useQuickCompanyLookup();
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  const handleCompanyLookup = useCallback(
    async (_info: any, lookupPending: boolean) => {
      console.log("Looking up company with ID:", companyId, "lookupPending:", lookupPending);
      
      if (lookupPending) {
        // If lookup is pending, don't hide info yet
        return null;
      }
      
      setShowCompanyInfo(false);
      
      if (companyId && companyId.length >= 10) {
        try {
          const result = await fetchCompany(companyId);
          console.log("Company lookup result:", result);
          
          if (result) {
            setShowCompanyInfo(true);
          }
          
          return result;
        } catch (error) {
          console.error("Error during company lookup:", error);
          return null;
        }
      }
      
      return null;
    },
    [companyId, fetchCompany]
  );

  useEffect(() => {
    // Reset visible info when ID changes
    if (!companyId || companyId.length < 10) {
      setShowCompanyInfo(false);
    }
  }, [companyId]);

  return { 
    companyInfo, 
    companyLoading, 
    showCompanyInfo, 
    setShowCompanyInfo, 
    handleCompanyLookup 
  };
}
