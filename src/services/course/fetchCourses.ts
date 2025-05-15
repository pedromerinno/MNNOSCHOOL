
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Course } from "@/components/admin/courses/types";

// Cache em memória para otimizar requisições
const coursesCache = new Map<string, {data: Course[], timestamp: number}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Fetches courses, optionally filtered by company ID
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
      // Fetch only courses for this company
      console.log(`Fetching courses for company: ${companyId}`);
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
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log(`Loaded ${data?.length || 0} courses for company ${companyId}`);
      
      // Armazenar no cache
      coursesCache.set(cacheKey, {
        data: data || [],
        timestamp: Date.now()
      });
      
      return data || [];
    } else {
      // Fetch all courses
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
