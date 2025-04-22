
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";

export const createCourse = async (courseData: CourseFormValues): Promise<string | null> => {
  try {
    // First create the course
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
      
      // Insert the company-course relations
      const { error: relationError } = await supabase
        .from('company_courses')
        .insert(companyRelations);
        
      if (relationError) throw relationError;

      // Notifications should be created by the database trigger
      // But we'll log information to help with debugging
      console.log(`Course created: ${courseId} for companies: ${courseData.companyIds.join(', ')}`);
    }

    toast.success('Curso criado', {
      description: 'O novo curso foi criado com sucesso.',
    });

    // Dispatch an event that can be listened to by other components for refreshing data
    window.dispatchEvent(new CustomEvent('course-created', { 
      detail: { courseId } 
    }));
    
    return courseId;
  } catch (error: any) {
    console.error('Error creating course:', error);
    toast.error('Erro ao criar curso', {
      description: error.message,
    });
    return null;
  }
};
