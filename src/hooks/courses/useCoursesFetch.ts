
import { useEffect, useRef } from "react";

export function useCoursesFetch(
  selectedCompany: any,
  lastSelectedCompanyId: string | null,
  initialLoadDone: React.MutableRefObject<boolean>,
  fetchCourseData: (forceRefresh?: boolean) => Promise<void>
) {
  // Use ref to store fetchCourseData to avoid recreating effect
  const fetchCourseDataRef = useRef<((forceRefresh?: boolean) => Promise<void>) | null>(null);
  useEffect(() => {
    fetchCourseDataRef.current = fetchCourseData;
  }, [fetchCourseData]);

  // Run the fetch only when selectedCompany changes or on component mount
  useEffect(() => {
    if (selectedCompany && (!initialLoadDone.current || selectedCompany.id !== lastSelectedCompanyId) && fetchCourseDataRef.current) {
      fetchCourseDataRef.current();
    }
  }, [selectedCompany?.id, lastSelectedCompanyId]); // Only depend on company ID, not the whole object
}
