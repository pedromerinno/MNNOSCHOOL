
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";

/**
 * Creates a new course and notifies company users
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

    // Create company relations and notifications
    if (courseData.companyIds && courseData.companyIds.length > 0) {
      const companyRelations = courseData.companyIds.map(companyId => ({
        empresa_id: companyId,
        course_id: courseId
      }));
      
      // Insert company relations
      const { error: relationError } = await supabase
        .from('company_courses')
        .insert(companyRelations);
      
      if (relationError) throw relationError;

      // Create notifications for all company users
      const notifications = await Promise.all(courseData.companyIds.map(async (companyId) => {
        const { data: users } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', companyId);

        if (users) {
          const userNotifications = users.map(({ user_id }) => ({
            user_id,
            company_id: companyId,
            title: 'Novo curso disponível',
            content: `Um novo curso "${courseData.title}" foi adicionado.`,
            type: 'course',
            related_id: courseId,
            read: false,
          }));

          const { error: notificationError } = await supabase
            .from('user_notifications')
            .insert(userNotifications);

          if (notificationError) {
            console.error('Error creating notifications:', notificationError);
          }
        }
      }));
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
