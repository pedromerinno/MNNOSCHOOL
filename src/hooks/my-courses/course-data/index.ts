
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { CourseDataProps, CourseDataResult } from "./types";
import { useCourseFetching } from "./useCourseFetching";
import { calculateCourseStats } from "./useCourseStats";
import { useCourseDataError } from "./useCourseDataError";
import { sortRecentCourses } from "./useRecentCoursesSorting";

/**
 * Main hook for fetching and processing course data
 */
export const useCourseData = ({
  setStats,
  setAllCourses,
  setFilteredCourses,
  setRecentCourses,
  setHoursWatched,
  filterCourses,
  activeFilter
}: CourseDataProps): CourseDataResult => {
  const { selectedCompany } = useCompanies();
  const [loading, setLoading] = useState(true);
  
  // Use specialized hooks for distinct operations
  const {
    fetchCompanyCourses,
    fetchUserProgress,
    fetchCompletedLessons,
    mergeCoursesWithProgress
  } = useCourseFetching();
  
  const {
    error,
    setError,
    handleError
  } = useCourseDataError(setStats, setRecentCourses, setFilteredCourses, setAllCourses);
  
  /**
   * Main function to fetch course data
   */
  const fetchCourseData = useCallback(async () => {
    if (!selectedCompany) {
      console.log("No company selected, skipping course data fetch");
      setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
      setRecentCourses([]);
      setFilteredCourses([]);
      setAllCourses([]);
      setLoading(false);
      return;
    }
    
    console.log("Fetching course data for company:", selectedCompany.nome);
    setLoading(true);
    setError(null);
    
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        throw new Error('Usuário não autenticado');
      }
      
      console.log("Fetching courses for company ID:", selectedCompany.id);
      
      // Fetch courses and course IDs
      const { courseIds, coursesData } = await fetchCompanyCourses(selectedCompany.id);
      
      if (courseIds.length === 0) {
        // No courses found, reset states and return
        setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
        setRecentCourses([]);
        setFilteredCourses([]);
        setAllCourses([]);
        setLoading(false);
        return;
      }
      
      // Get user progress for these courses
      const progressData = await fetchUserProgress(user.id, courseIds);
      
      // Get completed lessons count
      const completedLessonsCount = await fetchCompletedLessons(user.id);
      
      // Calculate stats
      const { stats, estimatedHoursWatched } = calculateCourseStats(
        progressData,
        completedLessonsCount
      );
      
      setStats(stats);
      setHoursWatched(estimatedHoursWatched);
      
      // Process courses with progress info
      const coursesWithProgress = mergeCoursesWithProgress(coursesData, progressData);
      
      console.log(`Processed ${coursesWithProgress.length} courses with progress`);
      
      setAllCourses(coursesWithProgress);
      
      // Get recent courses
      const recentCoursesData = sortRecentCourses(coursesWithProgress);
      setRecentCourses(recentCoursesData);
      
      // Set filtered courses based on active filter
      filterCourses(coursesWithProgress, activeFilter);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedCompany,
    setStats,
    setAllCourses,
    setFilteredCourses,
    setRecentCourses,
    setHoursWatched,
    filterCourses,
    activeFilter,
    fetchCompanyCourses,
    fetchUserProgress,
    fetchCompletedLessons,
    mergeCoursesWithProgress,
    handleError,
    setError
  ]);

  return {
    loading,
    error,
    fetchCourseData
  };
};
