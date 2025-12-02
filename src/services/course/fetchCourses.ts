
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Course } from "@/components/admin/courses/types";

// Cache em memória para otimizar requisições
const coursesCache = new Map<string, {data: Course[], timestamp: number}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Fetches courses, optionally filtered by company ID and user job role
 */
export const fetchCourses = async (companyId?: string, forceRefresh: boolean = false): Promise<Course[]> => {
  try {
    // Verificar cache primeiro
    const cacheKey = companyId || 'all_courses';
    const cachedData = coursesCache.get(cacheKey);
    
    if (!forceRefresh && cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log(`[fetchCourses] Usando ${cachedData.data.length} cursos em cache para ${cacheKey}`);
      return cachedData.data;
    }
    
    if (companyId) {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user");
        return [];
      }
      
      // Get user profile to check their job role
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('cargo_id, super_admin')
        .eq('id', user.id)
        .single();
      
      console.log(`Fetching courses for company: ${companyId} with user profile:`, userProfile);
      
      // Get company courses
      const { data: companyCourses, error: companyCoursesError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', companyId);
      
      if (companyCoursesError) throw companyCoursesError;
      
      if (!companyCourses || companyCourses.length === 0) {
        console.log("No courses found for this company");
        return [];
      }
      
      const courseIds = companyCourses.map(cc => cc.course_id);
      console.log('All company course IDs:', courseIds);
      
      // Get course job role restrictions
      const { data: courseJobRoles } = await supabase
        .from('course_job_roles')
        .select('course_id, job_role_id')
        .in('course_id', courseIds);
      
      console.log('Course job roles restrictions:', courseJobRoles);
      
      // Filter courses based on user's job role and admin status
      let accessibleCourseIds = courseIds;
      
      // If user is not admin and has job role restrictions, apply filtering
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
          accessibleCourseIds = [...unrestrictedCourseIds, ...accessibleRestrictedCourses];
        }
      }
      
      console.log('Final accessible course IDs:', accessibleCourseIds);
      
      if (accessibleCourseIds.length === 0) {
        console.log("No accessible courses for user's job role");
        return [];
      }
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .in('id', accessibleCourseIds)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log(`Loaded ${data?.length || 0} accessible courses for company ${companyId}`);
      
      // Armazenar no cache
      coursesCache.set(cacheKey, {
        data: data || [],
        timestamp: Date.now()
      });
      
      return data || [];
    } else {
      // Fetch all courses (admin view)
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log("Cursos carregados com sucesso:", data?.length || 0);
      
      // Armazenar no cache
      coursesCache.set(cacheKey, {
        data: data || [],
        timestamp: Date.now()
      });
      
      return data || [];
    }
  } catch (error: any) {
    console.error("Erro ao carregar cursos:", error);
    toast.error('Erro ao carregar cursos', {
      description: error.message,
    });
    return [];
  }
};
