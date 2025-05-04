
import { useEffect } from "react";

export function useCoursesFetch(
  selectedCompany: any,
  lastSelectedCompanyId: string | null,
  initialLoadDone: React.MutableRefObject<boolean>,
  fetchCourseData: (forceRefresh?: boolean) => Promise<void>
) {
  // Run the fetch only when selectedCompany changes or on component mount
  useEffect(() => {
    if (selectedCompany && (!initialLoadDone.current || selectedCompany.id !== lastSelectedCompanyId)) {
      fetchCourseData();
    }
  }, [selectedCompany, fetchCourseData, lastSelectedCompanyId, initialLoadDone]);
}
