
import { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
      
      // Fetch courses for company
      const { data: companyAccess, error: accessError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompany.id);
      
      if (accessError) {
        console.error("Error fetching company access:", accessError);
        throw accessError;
      }
      
      if (!companyAccess || companyAccess.length === 0) {
        console.log("No courses found for company");
        setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
        setRecentCourses([]);
        setFilteredCourses([]);
        setAllCourses([]);
        setLoading(false);
        return;
      }
      
      const courseIds = companyAccess.map(access => access.course_id);
      console.log(`Found ${courseIds.length} course IDs for company`);
      
      // Get user progress for these courses
      const { data: progressData, error: progressError } = await supabase
        .from('user_course_progress')
        .select('course_id, progress, completed, last_accessed, favorite')
        .eq('user_id', user.id)
        .in('course_id', courseIds);
      
      if (progressError) {
        console.error('Error fetching progress:', progressError);
        toast({
          title: "Erro ao carregar progresso",
          description: progressError.message,
          variant: "destructive",
        });
        // Continue with empty progress data
        const progressMap: any[] = [];
        
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);
        
        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw coursesError;
        }
        
        const coursesWithProgress = coursesData?.map(course => {
          return {
            ...course,
            progress: 0,
            completed: false,
            last_accessed: null,
            favorite: false
          };
        }) || [];
        
        setAllCourses(coursesWithProgress);
        filterCourses(coursesWithProgress, activeFilter);
        setRecentCourses([]);
        setStats({favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0});
        setHoursWatched(0);
        setLoading(false);
        return;
      }
      
      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);
      
      if (coursesError) {
        console.error("Error fetching courses:", coursesError);
        throw coursesError;
      }
      
      console.log(`Fetched ${coursesData?.length || 0} courses`);
      
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
      
      // Calculate hours watched (mock data for now, could be replaced with actual tracking)
      // Here we estimate 15 minutes per completed lesson
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
      
      console.log(`Processed ${coursesWithProgress.length} courses with progress`);
      
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
      filterCourses(coursesWithProgress, activeFilter);
    } catch (error: any) {
      console.error('Error fetching course stats:', error);
      setError(error);
      toast({
        title: "Erro ao carregar cursos",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      // Reset states on error
      setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
      setRecentCourses([]);
      setFilteredCourses([]);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCompany, toast, setStats, setAllCourses, setFilteredCourses, setRecentCourses, setHoursWatched, filterCourses, activeFilter]);

  return {
    loading,
    error,
    fetchCourseData
  };
};
