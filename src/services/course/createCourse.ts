
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";

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

    // Associate course with companies
    if (courseData.companyIds && courseData.companyIds.length > 0) {
      const companyRelations = courseData.companyIds.map(companyId => ({
        empresa_id: companyId,
        course_id: courseId
      }));
      const { error: relationError } = await supabase
        .from('company_courses')
        .insert(companyRelations);
      if (relationError) throw relationError;

      // Create notifications for all users in the companies
      for (const companyId of courseData.companyIds) {
        const { data: users, error: usersError } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', companyId);
        
        if (!usersError && users) {
          // Convert the notifications to match the expected schema
          const notifications = users.map(user => ({
            user_id: user.user_id,
            company_id: companyId, // Required field from schema
            title: 'Novo curso disponível',
            content: `Um novo curso "${courseData.title}" foi adicionado.`, // Using 'content' instead of 'message'
            type: 'course_created',
            related_id: courseId // Using 'related_id' instead of 'link'
          }));

          const { error: notificationError } = await supabase
            .from('user_notifications')
            .insert(notifications);

          if (notificationError) {
            console.error('Error creating notifications:', notificationError);
          }
        }
      }
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
