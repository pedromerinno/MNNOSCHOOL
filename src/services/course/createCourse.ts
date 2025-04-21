
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";

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

    if (error) throw error;
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
      if (relationError) throw relationError;
    }

    toast.success('Curso criado', {
      description: 'O novo curso foi criado com sucesso.',
    });

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
