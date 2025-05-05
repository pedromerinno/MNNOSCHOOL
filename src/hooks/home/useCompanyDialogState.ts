
import { useState, useEffect } from "react";

export const useCompanyDialogState = (userCompanies: any[], isLoading: boolean, fetchCount: number, hasRedirectedToOnboarding: React.MutableRefObject<boolean>) => {
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);

  // Show company dialog if no companies
  useEffect(() => {
    if (!isLoading && userCompanies.length === 0 && fetchCount > 0 && !hasRedirectedToOnboarding.current) {
      setShowCompanyDialog(true);
    }
  }, [isLoading, userCompanies.length, fetchCount, hasRedirectedToOnboarding]);

  return {
    showCompanyDialog,
    setShowCompanyDialog
  };
};
