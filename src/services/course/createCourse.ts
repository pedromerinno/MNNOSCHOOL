
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
          .from('user_companies')
          .select('user_id')
          .eq('company_id', companyId);
        
        if (!usersError && users) {
          const notifications = users.map(user => ({
            user_id: user.user_id,
            title: 'Novo curso disponível',
            message: `Um novo curso "${courseData.title}" foi adicionado.`,
            type: 'course_created',
            link: `/courses/${courseId}`
          }));

          const { error: notificationError } = await supabase
            .from('notifications')
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
