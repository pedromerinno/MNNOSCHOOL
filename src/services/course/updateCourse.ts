
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";

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

    if (error) throw error;

    // If companyIds is provided, update the company relations
    if (courseData.companyIds && courseData.companyIds.length > 0) {
      // First remove existing relations
      const { error: deleteError } = await supabase
        .from('company_courses')
        .delete()
        .eq('course_id', courseId);
      if (deleteError) throw deleteError;

      // Then create new company relations
      const companyRelations = courseData.companyIds.map(companyId => ({
        empresa_id: companyId,
        course_id: courseId
      }));

      const { error: insertError } = await supabase
        .from('company_courses')
        .insert(companyRelations);
      if (insertError) throw insertError;
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
