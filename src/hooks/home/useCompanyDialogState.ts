
import { useState, useEffect, useRef } from "react";

export const useCompanyDialogState = (userCompanies: any[], isLoading: boolean, fetchCount: number, hasRedirectedToOnboarding: React.MutableRefObject<boolean>) => {
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const hasShownDialog = useRef(false);

  // Show company dialog if no companies, but only once
  useEffect(() => {
    if (!isLoading && userCompanies.length === 0 && fetchCount > 0 && !hasRedirectedToOnboarding.current && !hasShownDialog.current) {
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
