
import { useState, useEffect, useRef } from "react";

export const useCompanyDialogState = (userCompanies: any[], isLoading: boolean, fetchCount: number, hasRedirectedToOnboarding: React.MutableRefObject<boolean>) => {
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const hasShownDialog = useRef(false);
  const isInitialRender = useRef(true);

  // Show company dialog if no companies, but only once and after initial data is loaded
  useEffect(() => {
    // Skip effect on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Only show dialog if we have tried to fetch companies (fetchCount > 0)
    // and user has no companies, and we haven't shown the dialog yet or redirected to onboarding
    if (!isLoading && 
        userCompanies.length === 0 && 
        fetchCount > 0 && 
        !hasRedirectedToOnboarding.current && 
        !hasShownDialog.current) {
      console.log("[useCompanyDialogState] Showing company dialog - first time");
      hasShownDialog.current = true;
      setShowCompanyDialog(true);
    }
  }, [isLoading, userCompanies.length, fetchCount, hasRedirectedToOnboarding]);

  return {
    showCompanyDialog,
    setShowCompanyDialog,
    hasShownDialog
  };
};
