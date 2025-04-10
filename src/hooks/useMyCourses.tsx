
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";

export type FilterOption = 'all' | 'favorites' | 'completed' | 'in-progress';

export const useMyCourses = () => {
  const { selectedCompany } = useCompanies();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [stats, setStats] = useState({
    favorites: 0,
    inProgress: 0,
    completed: 0,
    videosCompleted: 0
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoursWatched, setHoursWatched] = useState(0);

  // Filter courses based on selected tab
  const filterCourses = (courses: any[], filter: FilterOption) => {
    switch (filter) {
      case 'favorites':
        setFilteredCourses(courses.filter(course => course.favorite));
        break;
      case 'completed':
        setFilteredCourses(courses.filter(course => course.completed));
        break;
      case 'in-progress':
        setFilteredCourses(courses.filter(course => course.progress > 0 && !course.completed));
        break;
      case 'all':
      default:
        setFilteredCourses(courses);
        break;
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter: FilterOption) => {
    setActiveFilter(newFilter);
    filterCourses(allCourses, newFilter);
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedCompany) return;
      
      setLoading(true);
      try {
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        // Fetch courses for company
        const { data: companyAccess, error: accessError } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id);
        
        if (accessError) throw accessError;
        
        if (!companyAccess || companyAccess.length === 0) {
          setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
          setRecentCourses([]);
          setFilteredCourses([]);
          setAllCourses([]);
          setLoading(false);
          return;
        }
        
        const courseIds = companyAccess.map(access => access.course_id);
        
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
          // Continue with empty progress data instead of throwing an error
          const emptyProgress: any[] = [];
          
          // Process with empty progress data
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds);
          
          if (coursesError) throw coursesError;
          
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
          setFilteredCourses(coursesWithProgress);
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
        
        if (coursesError) throw coursesError;
        
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
    };
    
    fetchStats();
  }, [selectedCompany, toast]);

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
