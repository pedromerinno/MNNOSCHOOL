
import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { Course, CourseStats } from "./types";
import { durationToHours } from "@/utils/durationUtils";

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
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Use refs to avoid recreating callback when dependencies change
  const selectedCompanyRef = useRef(selectedCompany);
  const activeFilterRef = useRef(activeFilter);
  const toastRef = useRef(toast);
  const userRef = useRef(user);
  const userProfileRef = useRef(userProfile);
  
  useEffect(() => {
    selectedCompanyRef.current = selectedCompany;
    activeFilterRef.current = activeFilter;
    toastRef.current = toast;
    userRef.current = user;
    userProfileRef.current = userProfile;
  }, [selectedCompany, activeFilter, toast, user, userProfile]);

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
      // Get user ID - use from context if available, otherwise fetch
      const currentUser = userRef.current || (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        console.error('User not authenticated');
        throw new Error('Usuário não autenticado');
      }
      
      // Use userProfile from context if available, otherwise fetch
      // Also fetch user_empresa to check is_admin status
      const [profileResult, companyAccessResult, userEmpresaResult] = await Promise.all([
        // Only fetch profile if not in context
        userProfileRef.current 
          ? Promise.resolve({ data: userProfileRef.current, error: null })
          : supabase
              .from('profiles')
              .select('cargo_id, super_admin')
              .eq('id', currentUser.id)
              .single(),
        // Fetch company courses access
        supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', currentCompany.id),
        // Fetch user_empresa to check admin status
        supabase
          .from('user_empresa')
          .select('cargo_id, is_admin')
          .eq('user_id', currentUser.id)
          .eq('empresa_id', currentCompany.id)
          .maybeSingle()
      ]);
      
      const userProfile = profileResult.data;
      const { data: companyAccess, error: accessError } = companyAccessResult;
      const { data: userEmpresa } = userEmpresaResult;
      
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
      
      // Check if user is admin (from user_empresa or super_admin from profile)
      const isAdmin = userEmpresa?.is_admin === true || userProfile?.super_admin === true;
      const userJobRoleId = userEmpresa?.cargo_id || userProfile?.cargo_id;
      
      console.log("My courses - User admin status:", { isAdmin, userJobRoleId });
      
      // Filter courses based on job role restrictions (only if not admin)
      let filteredCourseIds = courseIds;
      
      if (!isAdmin) {
        // Get courses with job role restrictions in parallel with other queries
        const { data: courseJobRoles } = await supabase
          .from('course_job_roles')
          .select('course_id, job_role_id')
          .in('course_id', courseIds);
        
        console.log("My courses - Course job roles:", courseJobRoles);
        
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
      
      // Paralelizar queries críticas: cursos e progresso do curso
      // Essas são as mais importantes para mostrar conteúdo rapidamente
      const [coursesResult, progressResult] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .in('id', filteredCourseIds),
        supabase
          .from('user_course_progress')
          .select('course_id, progress, completed, last_accessed, favorite')
          .eq('user_id', currentUser.id)
          .in('course_id', filteredCourseIds)
      ]);
      
      const { data: coursesData, error: coursesError } = coursesResult;
      const { data: progressData, error: progressError } = progressResult;
      
      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }
      
      if (progressError) {
        console.error('Error fetching progress:', progressError);
        // Continue with empty progress data instead of throwing
      }
      
      // Process courses with progress info immediately to show content faster
      const progressMap = progressData || [];
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
      
      // Set courses immediately so UI can render
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
      
      // Calcular stats básicos dos cursos já carregados (rápido, sem query adicional)
      const inProgress = progressMap.filter(p => p.progress > 0 && !p.completed).length;
      const completed = progressMap.filter(p => p.completed).length;
      const favorites = progressMap.filter(p => p.favorite).length || 0;
      
      // Set stats básicos imediatamente
      setStats({
        favorites,
        inProgress,
        completed,
        videosCompleted: 0 // Será atualizado depois
      });
      
      // Marcar loading como false AGORA para mostrar conteúdo rapidamente
      setLoading(false);
      
      // Carregar stats detalhados e horas assistidas de forma assíncrona (não bloqueia UI)
      // Isso permite que a UI mostre os cursos imediatamente
      const loadDetailedStats = async () => {
        try {
          const lessonProgressResult = await supabase
            .from('user_lesson_progress')
            .select('id, lesson_id, completed')
            .eq('user_id', currentUser.id)
            .eq('completed', true);
        
          const { data: lessonProgressData, error: lessonProgressError } = lessonProgressResult;
          
          if (lessonProgressError) {
            console.error('Error fetching lesson progress:', lessonProgressError);
            return;
          }
          
          const completedLessonsCount = lessonProgressData?.length || 0;
          
          // Calculate hours watched using real lesson durations
          let totalHoursWatched = 0;
          if (lessonProgressData && lessonProgressData.length > 0) {
            // Get lesson IDs from completed lessons
            const completedLessonIds = lessonProgressData.map(progress => progress.lesson_id);
            
            // Fetch lesson durations for completed lessons
            const { data: completedLessons, error: lessonsError } = await supabase
              .from('lessons')
              .select('id, duration')
              .in('id', completedLessonIds);
            
            if (!lessonsError && completedLessons) {
              // Sum up all durations in hours
              totalHoursWatched = completedLessons.reduce((total, lesson) => {
                if (lesson.duration) {
                  return total + durationToHours(lesson.duration);
                }
                return total;
              }, 0);
              
              // Round to 1 decimal place
              totalHoursWatched = Math.round(totalHoursWatched * 10) / 10;
            }
          }
          
          // Fallback to estimate if no duration data available
          const hoursWatched = totalHoursWatched > 0 
            ? totalHoursWatched 
            : Math.round((completedLessonsCount * 15) / 60 * 10) / 10;
          
          // Atualizar stats com informações detalhadas
          setStats({
            favorites,
            inProgress,
            completed,
            videosCompleted: completedLessonsCount
          });
          
          setHoursWatched(hoursWatched);
        } catch (error: any) {
          console.error('Error loading detailed stats:', error);
          // Não mostrar toast para erro em stats detalhados, pois não é crítico
        }
      };
      
      // Carregar stats detalhados em background (não bloqueia UI)
      loadDetailedStats();
      
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
      setLoading(false);
    }
  }, []); // Empty dependencies - using refs for all dynamic values

  return {
    loading,
    setLoading,
    fetchCourseData
  };
};
