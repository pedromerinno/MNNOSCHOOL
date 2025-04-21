
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Course } from '@/components/admin/courses/types';
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";

/**
 * Fetches courses, optionally filtered by company ID
 */
export const fetchCourses = async (companyId?: string): Promise<Course[]> => {
  try {
    if (companyId) {
      // If companyId is provided, fetch only courses for this company
      console.log(`Fetching courses for company: ${companyId}`);
      
      // First, get the course IDs associated with this company
      const { data: companyCourses, error: companyCoursesError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', companyId);
        
      if (companyCoursesError) {
        throw companyCoursesError;
      }
      
      if (!companyCourses || companyCourses.length === 0) {
        console.log("No courses found for this company");
        return [];
      }
      
      const courseIds = companyCourses.map(cc => cc.course_id);
      
      // Then fetch the actual courses
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log(`Loaded ${data?.length || 0} courses for company ${companyId}`);
      return data || [];
    } else {
      // Otherwise, fetch all courses
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

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

/**
 * Deletes a course by ID
 */
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      throw error;
    }

    toast.success('Curso excluído', {
      description: 'O curso foi excluído com sucesso.',
    });
    
    return true;
  } catch (error: any) {
    toast.error('Erro ao excluir curso', {
      description: error.message,
    });
    return false;
  }
};

/**
 * Creates a new course
 */
export const createCourse = async (courseData: CourseFormValues): Promise<string | null> => {
  try {
    const { data: newCourse, error } = await supabase
      .from('courses')
      .insert([{
        title: courseData.title,
        description: courseData.description,
        image_url: courseData.image_url,
        instructor: courseData.instructor,
        tags: courseData.tags,
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    const courseId = newCourse.id;
    
    // If companyIds were provided, associate the course with those companies
    if (courseData.companyIds && courseData.companyIds.length > 0) {
      // Create an array of relationships to insert
      const companyRelations = courseData.companyIds.map(companyId => ({
        empresa_id: companyId,
        course_id: courseId
      }));
      
      const { error: relationError } = await supabase
        .from('company_courses')
        .insert(companyRelations);
        
      if (relationError) {
        throw relationError;
      }
    }

    toast.success('Curso criado', {
      description: 'O novo curso foi criado com sucesso.',
    });
    
    // Dispatch a custom event to notify that a course was created
    window.dispatchEvent(new CustomEvent('course-created', { 
      detail: { courseId } 
    }));
    
    return courseId;
  } catch (error: any) {
    toast.error('Erro ao criar curso', {
      description: error.message,
    });
    return null;
  }
};

/**
 * Updates an existing course
 */
export const updateCourse = async (courseId: string, courseData: CourseFormValues): Promise<boolean> => {
  try {
    // First update the course details
    const { error } = await supabase
      .from('courses')
      .update({
        title: courseData.title,
        description: courseData.description,
        image_url: courseData.image_url,
        instructor: courseData.instructor,
        tags: courseData.tags,
      })
      .eq('id', courseId);

    if (error) {
      throw error;
    }
    
    // If companyIds is provided, update the company relations
    if (courseData.companyIds && courseData.companyIds.length > 0) {
      // First remove existing relations
      const { error: deleteError } = await supabase
        .from('company_courses')
        .delete()
        .eq('course_id', courseId);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Then create new company relations
      const companyRelations = courseData.companyIds.map(companyId => ({
        empresa_id: companyId,
        course_id: courseId
      }));
      
      const { error: insertError } = await supabase
        .from('company_courses')
        .insert(companyRelations);
        
      if (insertError) {
        throw insertError;
      }
    }
    
    toast.success('Curso atualizado', {
      description: 'As alterações foram salvas com sucesso.',
    });
    
    return true;
  } catch (error: any) {
    toast.error('Erro ao atualizar curso', {
      description: error.message,
    });
    return false;
  }
};
