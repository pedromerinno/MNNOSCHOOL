
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { Course } from '../types/CourseTypes';

export const useCourseListData = (filter: 'all' | 'in-progress' | 'completed' | 'not-started' = 'all') => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCompany, isLoading: companyLoading } = useCompanies();
  const { toast } = useToast();
  const initialLoadComplete = useRef(false);
  const currentCompanyId = useRef<string | null>(null);

  useEffect(() => {
    // Reset state if company changed
    if (selectedCompany?.id !== currentCompanyId.current) {
      setCourses([]);
      initialLoadComplete.current = false;
      currentCompanyId.current = selectedCompany?.id || null;
    }

    const fetchCourses = async () => {
      // Skip if no selected company or already loading
      if (!selectedCompany || companyLoading) return;

      // Avoid multiple simultaneous requests
      if (loading && initialLoadComplete.current && currentCompanyId.current === selectedCompany.id) return;

      try {
        setLoading(true);
        console.log("Fetching courses with filter:", filter);
        console.log("Selected company:", selectedCompany?.nome || "None");
        
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || '';
        
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        console.log("Fetching courses for company:", selectedCompany.id);
        
        // Get company course IDs
        const { data: companyAccess, error: accessError } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id);
        
        if (accessError) {
          throw accessError;
        }
        
        // Handle no courses case
        if (!companyAccess || companyAccess.length === 0) {
          console.log("No courses found for this company");
          setCourses([]);
          initialLoadComplete.current = true;
          return;
        }
        
        const accessibleCourseIds = companyAccess.map(access => access.course_id);
        console.log(`Found ${accessibleCourseIds.length} course IDs for company`);
        
        // Fetch course data
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', accessibleCourseIds);
          
        if (coursesError) {
          throw coursesError;
        }
        
        let availableCourses = coursesData || [];
        console.log(`Loaded ${availableCourses.length} courses`);
        
        // Get user's course progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('course_id, progress, completed, favorite')
          .eq('user_id', userId);
          
        if (progressError) {
          console.error('Error fetching progress:', progressError);
        }
        
        // Add progress information to courses
        const coursesWithProgress = availableCourses.map(course => {
          const userProgress = progressData?.find(progress => progress.course_id === course.id);
          return {
            ...course,
            progress: userProgress?.progress || 0,
            completed: userProgress?.completed || false,
            favorite: userProgress?.favorite || false
          };
        });
        
        // Apply filter
        let finalCourses = coursesWithProgress;
        
        if (filter === 'in-progress') {
          finalCourses = coursesWithProgress.filter(course => 
            (course.progress || 0) > 0 && !(course.completed || false)
          );
        } else if (filter === 'completed') {
          finalCourses = coursesWithProgress.filter(course => 
            course.completed || false
          );
        } else if (filter === 'not-started') {
          finalCourses = coursesWithProgress.filter(course => 
            (course.progress || 0) === 0
          );
        }
        
        console.log(`Displaying ${finalCourses.length} courses after filtering`);
        setCourses(finalCourses);
        initialLoadComplete.current = true;
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        toast({
          title: 'Erro ao carregar cursos',
          description: error.message || 'Ocorreu um erro ao buscar os cursos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [selectedCompany, filter, toast, companyLoading, loading]);

  return {
    courses,
    loading: companyLoading || (loading && !initialLoadComplete.current),
    isInitialLoadComplete: initialLoadComplete.current,
    hasNoCourses: initialLoadComplete.current && courses.length === 0
  };
};
