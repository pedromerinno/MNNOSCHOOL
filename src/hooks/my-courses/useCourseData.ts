
import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";
import { Course, CourseStats } from "./types";

export const useCourseData = (
  setStats: (stats: CourseStats) => void,
  setAllCourses: (courses: Course[]) => void,
  setFilteredCourses: (courses: Course[]) => void,
  setRecentCourses: (courses: Course[]) => void,
  setHoursWatched: (hours: number) => void,
  filterCourses: (courses: Course[], filter: string) => void,
  activeFilter: string
) => {
  const { selectedCompany } = useCompanies();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Use refs to avoid recreating callback when dependencies change
  const selectedCompanyRef = useRef(selectedCompany);
  const activeFilterRef = useRef(activeFilter);
  const toastRef = useRef(toast);
  
  useEffect(() => {
    selectedCompanyRef.current = selectedCompany;
    activeFilterRef.current = activeFilter;
    toastRef.current = toast;
  }, [selectedCompany, activeFilter, toast]);

  const fetchCourseData = useCallback(async () => {
    const currentCompany = selectedCompanyRef.current;
    if (!currentCompany?.id) {
      console.log("No selected company, resetting data");
      setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
      setRecentCourses([]);
      setFilteredCourses([]);
      setAllCourses([]);
      setHoursWatched(0);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log("Fetching course data for company:", currentCompany.nome);
    
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        throw new Error('Usuário não autenticado');
      }
      
      // Get user profile to check their job role
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('cargo_id, super_admin')
        .eq('id', user.id)
        .single();
      
      console.log("My courses - User profile:", userProfile);
      
      // Fetch courses for company
      const { data: companyAccess, error: accessError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', currentCompany.id);
      
      if (accessError) {
        console.error('Error fetching company access:', accessError);
        throw accessError;
      }
      
      if (!companyAccess || companyAccess.length === 0) {
        console.log("No courses found for company");
        setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
        setRecentCourses([]);
        setFilteredCourses([]);
        setAllCourses([]);
        setHoursWatched(0);
        setLoading(false);
        return;
      }
      
      const courseIds = companyAccess.map(access => access.course_id);
      console.log(`Found ${courseIds.length} course IDs for company`);
      
      // Get courses with job role restrictions
      const { data: courseJobRoles } = await supabase
        .from('course_job_roles')
        .select('course_id, job_role_id')
        .in('course_id', courseIds);
      
      console.log("My courses - Course job roles:", courseJobRoles);
      
      // Filter courses based on user's job role and admin status
      let filteredCourseIds = courseIds;
      
      // If user is not admin, apply job role filtering
      if (!userProfile?.is_admin && !userProfile?.super_admin) {
        const userJobRoleId = userProfile?.cargo_id;
        console.log("My courses - Filtering for user job role:", userJobRoleId);
        
        if (courseJobRoles && courseJobRoles.length > 0) {
          // Get all courses that have role restrictions
          const restrictedCourseIds = [...new Set(courseJobRoles.map(cjr => cjr.course_id))];
          
          // Get courses without any restrictions (available to all)
          const unrestrictedCourseIds = courseIds.filter(id => !restrictedCourseIds.includes(id));
          
          // Get courses that the user can access based on their job role
          let accessibleRestrictedCourses: string[] = [];
          if (userJobRoleId) {
            accessibleRestrictedCourses = courseJobRoles
              .filter(cjr => cjr.job_role_id === userJobRoleId)
              .map(cjr => cjr.course_id);
          }
          
          // Combine unrestricted courses and accessible restricted courses
          filteredCourseIds = [...unrestrictedCourseIds, ...accessibleRestrictedCourses];
          console.log("My courses - Final filtered course IDs:", filteredCourseIds);
        }
      }
      
      if (filteredCourseIds.length === 0) {
        console.log("No accessible courses for user's job role");
        setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
        setRecentCourses([]);
        setFilteredCourses([]);
        setAllCourses([]);
        setHoursWatched(0);
        setLoading(false);
        return;
      }
      
      // Get user progress for these courses
      const { data: progressData, error: progressError } = await supabase
        .from('user_course_progress')
        .select('course_id, progress, completed, last_accessed, favorite')
        .eq('user_id', user.id)
        .in('course_id', filteredCourseIds);
      
      if (progressError) {
        console.error('Error fetching progress:', progressError);
        // Continue with empty progress data instead of throwing
      }
      
      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', filteredCourseIds);
      
      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }
      
      // Get completed lessons count for video stats
      const { data: lessonProgressData, error: lessonProgressError } = await supabase
        .from('user_lesson_progress')
        .select('id, completed')
        .eq('user_id', user.id)
        .eq('completed', true);
      
      if (lessonProgressError) {
        console.error('Error fetching lesson progress:', lessonProgressError);
      }
      
      const completedLessonsCount = lessonProgressData?.length || 0;
      
      // Calculate hours watched (estimate 15 minutes per completed lesson)
      const estimatedHoursWatched = Math.round((completedLessonsCount * 15) / 60 * 10) / 10;
      
      const progressMap = progressData || [];
      const inProgress = progressMap.filter(p => p.progress > 0 && !p.completed).length;
      const completed = progressMap.filter(p => p.completed).length;
      const favorites = progressMap.filter(p => p.favorite).length || 0;
      
      setStats({
        favorites,
        inProgress,
        completed,
        videosCompleted: completedLessonsCount
      });
      
      setHoursWatched(estimatedHoursWatched);
      
      // Process courses with progress info
      const coursesWithProgress = coursesData?.map(course => {
        const progress = progressMap.find(p => p.course_id === course.id);
        return {
          ...course,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
          last_accessed: progress?.last_accessed || null,
          favorite: progress?.favorite || false
        };
      }) || [];
      
      setAllCourses(coursesWithProgress);
      
      // Get courses in progress (not completed and with progress > 0)
      const inProgressCourses = coursesWithProgress
        .filter(c => c.progress > 0 && !c.completed)
        .sort((a, b) => {
          // Sort by last accessed, if available
          if (a.last_accessed && b.last_accessed) {
            return new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime();
          }
          // If no last_accessed, sort by progress (higher progress first)
          return b.progress - a.progress;
        });
      
      setRecentCourses(inProgressCourses.slice(0, 3));
      
      // Initially set filtered courses based on active filter
      filterCourses(coursesWithProgress, activeFilterRef.current);
      
      console.log(`Successfully loaded ${coursesWithProgress.length} accessible courses`);
    } catch (error: any) {
      console.error('Error fetching course stats:', error);
      toastRef.current({
        title: "Erro ao carregar cursos",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      // Reset states on error
      setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
      setRecentCourses([]);
      setFilteredCourses([]);
      setAllCourses([]);
      setHoursWatched(0);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependencies - using refs for all dynamic values

  return {
    loading,
    setLoading,
    fetchCourseData
  };
};
