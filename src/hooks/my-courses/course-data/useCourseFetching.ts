
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "../types";

/**
 * Fetches course data from database
 */
export const useCourseFetching = () => {
  /**
   * Fetch available courses for a company
   */
  const fetchCompanyCourses = useCallback(async (companyId: string) => {
    if (!companyId) {
      throw new Error("No company ID provided");
    }
    
    const { data: companyAccess, error: accessError } = await supabase
      .from('company_courses')
      .select('course_id')
      .eq('empresa_id', companyId);
    
    if (accessError) {
      console.error("Error fetching company access:", accessError);
      throw accessError;
    }
    
    if (!companyAccess || companyAccess.length === 0) {
      console.log("No courses found for company");
      return { courseIds: [], coursesData: [] };
    }
    
    const courseIds = companyAccess.map(access => access.course_id);
    console.log(`Found ${courseIds.length} course IDs for company`);
    
    // Fetch courses
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('id', courseIds);
    
    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
      throw coursesError;
    }
    
    console.log(`Fetched ${coursesData?.length || 0} courses`);
    
    return { courseIds, coursesData: coursesData || [] };
  }, []);
  
  /**
   * Fetch user progress for courses
   */
  const fetchUserProgress = useCallback(async (userId: string, courseIds: string[]) => {
    if (!userId || courseIds.length === 0) {
      return [];
    }
    
    const { data: progressData, error: progressError } = await supabase
      .from('user_course_progress')
      .select('course_id, progress, completed, last_accessed, favorite')
      .eq('user_id', userId)
      .in('course_id', courseIds);
    
    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return [];
    }
    
    return progressData || [];
  }, []);
  
  /**
   * Fetch completed lessons count
   */
  const fetchCompletedLessons = useCallback(async (userId: string) => {
    if (!userId) {
      return 0;
    }
    
    const { data: lessonProgressData, error: lessonProgressError } = await supabase
      .from('user_lesson_progress')
      .select('id, completed')
      .eq('user_id', userId)
      .eq('completed', true);
    
    if (lessonProgressError) {
      console.error('Error fetching lesson progress:', lessonProgressError);
      return 0;
    }
    
    return lessonProgressData?.length || 0;
  }, []);
  
  /**
   * Merge courses with their progress data
   */
  const mergeCoursesWithProgress = useCallback((courses: any[], progressMap: any[]) => {
    return courses.map(course => {
      const progress = progressMap.find(p => p.course_id === course.id);
      return {
        ...course,
        progress: progress?.progress || 0,
        completed: progress?.completed || false,
        last_accessed: progress?.last_accessed || null,
        favorite: progress?.favorite || false
      };
    });
  }, []);
  
  return {
    fetchCompanyCourses,
    fetchUserProgress,
    fetchCompletedLessons,
    mergeCoursesWithProgress
  };
};
