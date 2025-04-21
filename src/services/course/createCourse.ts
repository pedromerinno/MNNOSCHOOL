
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

      // Create notifications for all users in the companies
      for (const companyId of courseData.companyIds) {
        // Get all users in the company
        const { data: companyUsers, error: usersError } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', companyId);

        if (usersError) throw usersError;

        if (companyUsers && companyUsers.length > 0) {
          // Create notifications for each user
          const notifications = companyUsers.map(user => ({
            user_id: user.user_id,
            company_id: companyId,
            title: 'New Course Available',
            content: `A new course "${courseData.title}" has been added to your company's library.`,
            type: 'course',
            related_id: courseId,
            read: false
          }));

          const { error: notificationError } = await supabase
            .from('user_notifications')
            .insert(notifications);

          if (notificationError) throw notificationError;
        }
      }
    }

    toast.success('Course created', {
      description: 'The new course has been created successfully.',
    });

    window.dispatchEvent(new CustomEvent('course-created', { 
      detail: { courseId } 
    }));
    return courseId;
  } catch (error: any) {
    toast.error('Error creating course', {
      description: error.message,
    });
    return null;
  }
};
