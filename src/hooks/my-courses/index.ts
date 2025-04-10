
import { useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useFilteredCourses } from "./useFilteredCourses";
import { useCourseStats } from "./useCourseStats";
import { useRecentCourses } from "./useRecentCourses";
import { useCourseData } from "./useCourseData";
import { FilterOption } from "./types";

export const useMyCourses = () => {
  const { selectedCompany } = useCompanies();
  
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
    fetchCourseData();
  }, [selectedCompany, fetchCourseData]);

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
