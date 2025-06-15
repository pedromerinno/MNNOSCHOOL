
import { useEffect, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useFilteredCourses } from "./useFilteredCourses";
import { useCourseStats } from "./useCourseStats";
import { useRecentCourses } from "./useRecentCourses";
import { useCourseData } from "./useCourseData";
import { FilterOption } from "./types";

export const useMyCourses = () => {
  const { selectedCompany } = useCompanies();
  const hasLoadedRef = useRef(false);
  const lastCompanyIdRef = useRef<string | null>(null);
  
  // Use our smaller, specialized hooks
  const { 
    filteredCourses, 
    activeFilter, 
    allCourses, 
    setAllCourses,
    setFilteredCourses, 
    filterCourses,
    handleFilterChange 
  } = useFilteredCourses();
  
  const { 
    stats, 
    setStats, 
    hoursWatched, 
    setHoursWatched 
  } = useCourseStats();
  
  const { 
    recentCourses, 
    setRecentCourses 
  } = useRecentCourses();
  
  const { 
    loading, 
    fetchCourseData 
  } = useCourseData(
    setStats,
    setAllCourses,
    setFilteredCourses,
    setRecentCourses,
    setHoursWatched,
    filterCourses,
    activeFilter
  );

  // Load course data when component mounts or when company changes
  useEffect(() => {
    const companyId = selectedCompany?.id;
    
    console.log("useMyCourses effect triggered:", {
      companyId,
      companyName: selectedCompany?.nome,
      hasLoaded: hasLoadedRef.current,
      lastCompanyId: lastCompanyIdRef.current
    });
    
    // Only fetch if company ID exists and has changed
    if (companyId && (companyId !== lastCompanyIdRef.current || !hasLoadedRef.current)) {
      console.log("Fetching course data for company change");
      lastCompanyIdRef.current = companyId;
      hasLoadedRef.current = true;
      fetchCourseData();
    } else if (!companyId) {
      // Reset everything if no company selected
      console.log("No company selected, resetting data");
      hasLoadedRef.current = false;
      lastCompanyIdRef.current = null;
    }
  }, [selectedCompany?.id, fetchCourseData]);

  return {
    activeFilter,
    stats,
    recentCourses,
    filteredCourses,
    loading,
    hoursWatched,
    handleFilterChange,
    companyColor: selectedCompany?.cor_principal || "#1EAEDB",
  };
};

// Re-export the type for convenience
export type { FilterOption } from "./types";
