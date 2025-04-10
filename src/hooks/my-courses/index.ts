import { useEffect, useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useFilteredCourses } from "./useFilteredCourses";
import { useCourseStats } from "./useCourseStats";
import { useRecentCourses } from "./useRecentCourses";
import { useCourseData } from "./course-data";
import { FilterOption, Course, CourseStats } from "./types";

export const useMyCourses = () => {
  const { selectedCompany, isLoading: companyLoading } = useCompanies();
  const [initialized, setInitialized] = useState(false);
  
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
  
  // Use our refactored course data hook
  const { 
    loading, 
    fetchCourseData 
  } = useCourseData({
    setStats,
    setAllCourses,
    setFilteredCourses,
    setRecentCourses,
    setHoursWatched,
    filterCourses,
    activeFilter
  });

  // Load course data when component mounts or when company changes
  useEffect(() => {
    console.log("useMyCourses: fetchCourseData triggered", { selectedCompany: selectedCompany?.id });
    if (selectedCompany) {
      fetchCourseData();
      setInitialized(true);
    }
  }, [selectedCompany, fetchCourseData]);

  return {
    activeFilter,
    stats,
    recentCourses,
    filteredCourses,
    loading,
    hoursWatched,
    initialized,
    handleFilterChange,
    companyColor: selectedCompany?.cor_principal || "#1EAEDB",
    companyLoading
  };
};

// Re-export the types for convenience
export type { FilterOption, Course, CourseStats } from "./types";
