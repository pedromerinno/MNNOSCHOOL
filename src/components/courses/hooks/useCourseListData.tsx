
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
        
        // Get user profile to check their job role
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('cargo_id, is_admin, super_admin')
          .eq('id', userId)
          .single();
        
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
        
        // Get courses with job role restrictions
        const { data: courseJobRoles } = await supabase
          .from('course_job_roles')
          .select('course_id, job_role_id')
          .in('course_id', accessibleCourseIds);
        
        // Filter courses based on user's job role and admin status
        let filteredCourseIds = accessibleCourseIds;
        
        // If user is not admin and there are job role restrictions
        if (!userProfile?.is_admin && !userProfile?.super_admin && courseJobRoles && courseJobRoles.length > 0) {
          const restrictedCourseIds = courseJobRoles.map(cjr => cjr.course_id);
          const userJobRoleId = userProfile?.cargo_id;
          
          // Get courses that the user can access based on their job role
          const accessibleRestrictedCourses = courseJobRoles
            .filter(cjr => cjr.job_role_id === userJobRoleId)
            .map(cjr => cjr.course_id);
          
          // Get courses without restrictions
          const unrestrictedCourseIds = accessibleCourseIds.filter(id => !restrictedCourseIds.includes(id));
          
          // Combine unrestricted courses and accessible restricted courses
          filteredCourseIds = [...unrestrictedCourseIds, ...accessibleRestrictedCourses];
        }
        
        if (filteredCourseIds.length === 0) {
          console.log("No accessible courses for user's job role");
          setCourses([]);
          initialLoadComplete.current = true;
          return;
        }
        
        // Fetch course data
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', filteredCourseIds);
          
        if (coursesError) {
          throw coursesError;
        }
        
        let availableCourses = coursesData || [];
        console.log(`Loaded ${availableCourses.length} accessible courses`);
        
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
        
        console.log(`Displaying ${finalCourses.length} courses after filtering by job role and progress`);
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
