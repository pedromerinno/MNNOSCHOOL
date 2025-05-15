
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Course } from "@/components/admin/courses/types";

/**
 * Fetches courses, optionally filtered by company ID
 */
export const fetchCourses = async (companyId?: string): Promise<Course[]> => {
  try {
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
      return data || [];
    } else {
      // Fetch all courses
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log("Cursos carregados com sucesso:", data?.length || 0);
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
