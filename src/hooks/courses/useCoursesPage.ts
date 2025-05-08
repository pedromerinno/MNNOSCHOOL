
import { useCallback } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useCoursesState } from "./useCoursesState";
import { useCoursesFetching } from "./useCoursesFetching";
import { useCoursesEvents } from "./useCoursesEvents";
import { useCoursesFetch } from "./useCoursesFetch";
import { useCoursesPageUtils } from "./useCoursesPageUtils";
import { FilterOption } from "./types";

export function useCoursesPage() {
  const { selectedCompany } = useCompanies();
  
  const {
    activeFilter,
    setActiveFilter,
    featuredCourses,
    setFeaturedCourses,
    allCompanyCourses,
    setAllCompanyCourses,
    loading,
    setLoading,
    allCoursesLoading,
    setAllCoursesLoading,
    companyColor,
    lastSelectedCompanyId,
    setLastSelectedCompanyId,
    initialLoadDone,
    isDataReady
  } = useCoursesState();

  const { fetchCourseData } = useCoursesFetching(
    setFeaturedCourses,
    setAllCompanyCourses,
    setLoading,
    setAllCoursesLoading,
    setLastSelectedCompanyId,
    initialLoadDone
  );

  // Set up event listeners
  useCoursesEvents(selectedCompany, fetchCourseData);

  // Set up fetch on component mount or when selectedCompany changes
  useCoursesFetch(selectedCompany, lastSelectedCompanyId, initialLoadDone, fetchCourseData);

  // Utility functions
  const { getTitle } = useCoursesPageUtils(selectedCompany);

  // Expose refresh method
  const refreshCourses = useCallback(() => {
    if (selectedCompany) {
      console.log("Manually refreshing courses data");
      fetchCourseData(true);
    }
  }, [fetchCourseData, selectedCompany]);

  return {
    activeFilter,
    setActiveFilter,
    featuredCourses,
    allCompanyCourses,
    loading,
    allCoursesLoading,
    companyColor,
    getTitle,
    isDataReady,
    refreshCourses
  };
}
