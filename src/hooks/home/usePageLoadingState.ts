
import { useState, useEffect } from "react";

export const usePageLoadingState = (
  hasCachedCompany: boolean,
  selectedCompany: any | null,
  isLoading: boolean,
  fetchCount: number,
  isPageLoading: boolean
) => {
  const [pageLoading, setPageLoading] = useState(true);
  
  // Simplified loading logic with timeout
  useEffect(() => {
    // Always stop loading after a maximum of 1 second
    const timeoutId = setTimeout(() => {
      console.log("[usePageLoadingState] Timeout - forcing loading to stop");
      setPageLoading(false);
    }, 1000);
    
    // Stop loading immediately if we have cached data
    if (hasCachedCompany) {
      console.log("[usePageLoadingState] Has cached company - stopping loading");
      setPageLoading(false);
      clearTimeout(timeoutId);
      return;
    }
    
    // Stop loading if companies fetch is complete
    if (fetchCount > 0 && !isLoading) {
      console.log("[usePageLoadingState] Fetch complete - stopping loading");
      setPageLoading(false);
      clearTimeout(timeoutId);
      return;
    }
    
    return () => clearTimeout(timeoutId);
  }, [hasCachedCompany, selectedCompany, isLoading, fetchCount]);

  return {
    isPageLoading: pageLoading,
    setIsPageLoading: setPageLoading
  };
};
