
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
          await fetchCompany(companyId);
          console.log("Company lookup result:", companyInfo);
          
          // Check companyInfo state directly after the fetch operation has completed
          if (companyInfo) {
            setShowCompanyInfo(true);
          }
          
          return companyInfo;
        } catch (error) {
          console.error("Error during company lookup:", error);
          return null;
        }
      }
      
      return null;
    },
    [companyId, companyInfo, fetchCompany]
  );

  useEffect(() => {
    // Reset visible info when ID changes
    if (!companyId || companyId.length < 10) {
      setShowCompanyInfo(false);
    }
  }, [companyId]);

  useEffect(() => {
    // Update showCompanyInfo when companyInfo changes
    if (companyInfo) {
      setShowCompanyInfo(true);
    }
  }, [companyInfo]);

  return { 
    companyInfo, 
    companyLoading, 
    showCompanyInfo, 
    setShowCompanyInfo, 
    handleCompanyLookup 
  };
}
