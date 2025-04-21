
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
          // Execute the fetch and wait for it to complete
          await fetchCompany(companyId);
          
          // After fetch completes, log the current company info
          console.log("Company lookup result:", companyInfo);
          
          // No need to check result here - we'll use the useEffect below to update UI
          // when companyInfo actually changes (after the state update)
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
