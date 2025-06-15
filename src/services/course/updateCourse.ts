
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

    // Always update the company relations when editing a course
    // First remove existing relations
    const { error: deleteError } = await supabase
      .from('company_courses')
      .delete()
      .eq('course_id', courseId);
    
    if (deleteError) throw deleteError;

    // Then create new company relations if companyIds array exists and is not empty
    if (courseData.companyIds && courseData.companyIds.length > 0) {
      const companyRelations = courseData.companyIds.map(companyId => ({
        empresa_id: companyId,
        course_id: courseId
      }));

      const { error: insertError } = await supabase
        .from('company_courses')
        .insert(companyRelations);
        
      if (insertError) throw insertError;
    }

    // Update job role relations
    // First remove existing job role relations
    const { error: deleteJobRoleError } = await supabase
      .from('course_job_roles')
      .delete()
      .eq('course_id', courseId);
    
    if (deleteJobRoleError) throw deleteJobRoleError;

    // Then create new job role relations if jobRoleIds array exists and is not empty
    if (courseData.jobRoleIds && courseData.jobRoleIds.length > 0) {
      const jobRoleRelations = courseData.jobRoleIds.map(roleId => ({
        course_id: courseId,
        job_role_id: roleId
      }));

      const { error: insertJobRoleError } = await supabase
        .from('course_job_roles')
        .insert(jobRoleRelations);
        
      if (insertJobRoleError) throw insertJobRoleError;

      console.log(`Course-job role relations updated for course: ${courseId}`);
    }

    toast.success('Curso atualizado', {
      description: 'As alterações foram salvas com sucesso.',
    });

    return true;
  } catch (error: any) {
    console.error("Erro ao atualizar curso:", error);
    toast.error('Erro ao atualizar curso', {
      description: error.message,
    });
    return false;
  }
};
