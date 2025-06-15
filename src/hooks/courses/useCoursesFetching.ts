
import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";

export function useCoursesFetching(
  setFeaturedCourses: (courses: any[]) => void,
  setAllCompanyCourses: (courses: any[]) => void,
  setLoading: (loading: boolean) => void,
  setAllCoursesLoading: (loading: boolean) => void,
  setLastSelectedCompanyId: (id: string | null) => void,
  initialLoadDone: React.MutableRefObject<boolean>
) {
  const { selectedCompany } = useCompanies();
  const hasActiveRequest = useRef(false);
  
  // Memoized fetch function to prevent unnecessary re-renders
  const fetchCourseData = useCallback(async (forceRefresh = false) => {
    // If there's already an active request, don't start another one
    if (hasActiveRequest.current) {
      console.log("There's already an active request to fetch courses, ignoring.");
      return;
    }

    if (!selectedCompany) return;
    
    try {
      hasActiveRequest.current = true;
      setLoading(true);
      setAllCoursesLoading(true);
      setLastSelectedCompanyId(selectedCompany.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Get user profile to check their job role
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('cargo_id, is_admin, super_admin')
        .eq('id', user.id)
        .single();
      
      console.log('User profile:', userProfile);
      
      const { data: companyAccess, error: accessError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompany.id);
      
      if (accessError) {
        console.error("Error fetching company access:", accessError);
        throw accessError;
      }
      
      if (!companyAccess || companyAccess.length === 0) {
        console.log(`No courses found for company ${selectedCompany.nome}`);
        setFeaturedCourses([]);
        setAllCompanyCourses([]);
        setLoading(false);
        setAllCoursesLoading(false);
        initialLoadDone.current = true;
        return;
      }
      
      const courseIds = companyAccess.map(access => access.course_id);
      console.log('All company course IDs:', courseIds);
      
      // Get courses with job role restrictions
      const { data: courseJobRoles } = await supabase
        .from('course_job_roles')
        .select('course_id, job_role_id')
        .in('course_id', courseIds);
      
      console.log('Course job roles restrictions:', courseJobRoles);
      
      // Filter courses based on user's job role and admin status
      let availableCourseIds = courseIds;
      
      // If user is not admin and has a job role, apply filtering
      if (!userProfile?.is_admin && !userProfile?.super_admin) {
        const userJobRoleId = userProfile?.cargo_id;
        console.log('User job role ID:', userJobRoleId);
        
        if (courseJobRoles && courseJobRoles.length > 0) {
          // Get all courses that have role restrictions
          const restrictedCourseIds = [...new Set(courseJobRoles.map(cjr => cjr.course_id))];
          console.log('Courses with role restrictions:', restrictedCourseIds);
          
          // Get courses without any restrictions (available to all)
          const unrestrictedCourseIds = courseIds.filter(id => !restrictedCourseIds.includes(id));
          console.log('Unrestricted courses:', unrestrictedCourseIds);
          
          // Get courses that the user can access based on their job role
          let accessibleRestrictedCourses: string[] = [];
          if (userJobRoleId) {
            accessibleRestrictedCourses = courseJobRoles
              .filter(cjr => cjr.job_role_id === userJobRoleId)
              .map(cjr => cjr.course_id);
            console.log('Accessible restricted courses for user role:', accessibleRestrictedCourses);
          }
          
          // Combine unrestricted courses and accessible restricted courses
          availableCourseIds = [...unrestrictedCourseIds, ...accessibleRestrictedCourses];
        }
      }
      
      console.log('Final available course IDs for user:', availableCourseIds);
      
      if (availableCourseIds.length === 0) {
        console.log(`No accessible courses for user in company ${selectedCompany.nome}`);
        setFeaturedCourses([]);
        setAllCompanyCourses([]);
        setLoading(false);
        setAllCoursesLoading(false);
        initialLoadDone.current = true;
        return;
      }
      
      // Featured courses (for carousel)
      const { data: featuredCoursesData, error: featuredError } = await supabase
        .from('courses')
        .select('*')
        .in('id', availableCourseIds)
        .limit(5);
      
      if (featuredError) {
        console.error("Error fetching featured courses:", featuredError);
        throw featuredError;
      }
      
      if (featuredCoursesData && featuredCoursesData.length > 0) {
        console.log(`Fetched ${featuredCoursesData.length} featured courses`);
        setFeaturedCourses(featuredCoursesData);
      } else {
        setFeaturedCourses([]);
      }
      
      // All company courses
      const { data: allCoursesData, error: allCoursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', availableCourseIds)
        .order('created_at', { ascending: false });
      
      if (allCoursesError) {
        console.error("Error fetching all courses:", allCoursesError);
        throw allCoursesError;
      }
      
      if (allCoursesData && allCoursesData.length > 0) {
        console.log(`Fetched ${allCoursesData.length} total accessible courses`);
        setAllCompanyCourses(allCoursesData);
      } else {
        setAllCompanyCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Erro ao carregar cursos. Por favor, tente novamente.');
      setFeaturedCourses([]);
      setAllCompanyCourses([]);
    } finally {
      setLoading(false);
      setAllCoursesLoading(false);
      initialLoadDone.current = true;
      hasActiveRequest.current = false;
    }
  }, [selectedCompany, setFeaturedCourses, setAllCompanyCourses, setLoading, setAllCoursesLoading, setLastSelectedCompanyId, initialLoadDone]);

  return { fetchCourseData };
}
