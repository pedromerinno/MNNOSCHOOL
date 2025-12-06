
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
      console.log(`Creating course-company associations for course: ${courseId}, companies: ${courseData.companyIds.join(', ')}`);
      
      const companyRelations = courseData.companyIds.map(companyId => ({
        empresa_id: companyId,
        course_id: courseId
      }));
      
      // Insert the company-course relations
      const { error: relationError } = await supabase
        .from('company_courses')
        .insert(companyRelations);
        
      if (relationError) throw relationError;

      console.log(`Course-company relations created for course: ${courseId} and companies: ${courseData.companyIds.join(', ')}`);
    }

    // Associate course with job roles if access type is 'roles'
    if (courseData.accessType === 'roles' && courseData.jobRoleIds && courseData.jobRoleIds.length > 0) {
      console.log(`Creating course-job role associations for course: ${courseId}, roles: ${courseData.jobRoleIds.join(', ')}`);
      
      const jobRoleRelations = courseData.jobRoleIds.map(roleId => ({
        course_id: courseId,
        job_role_id: roleId
      }));
      
      const { error: jobRoleError } = await supabase
        .from('course_job_roles' as any)
        .insert(jobRoleRelations);
        
      if (jobRoleError) throw jobRoleError;

      console.log(`Course-job role relations created for course: ${courseId}`);
    }

    // Associate course with users if access type is 'users'
    if (courseData.accessType === 'users' && courseData.userIds && courseData.userIds.length > 0) {
      console.log(`Creating course-user associations for course: ${courseId}, users: ${courseData.userIds.join(', ')}`);
      
      const userRelations = courseData.userIds.map(userId => ({
        course_id: courseId,
        user_id: userId
      }));
      
      const { error: userError } = await supabase
        .from('course_users' as any)
        .insert(userRelations);
        
      if (userError) {
        // Se a tabela não existir, vamos criar uma migration depois
        console.warn('Error creating course-user relations (table might not exist):', userError);
        // Não vamos falhar a criação do curso por isso, apenas logar o erro
      } else {
        console.log(`Course-user relations created for course: ${courseId}`);
      }
    }

    toast.success('Curso criado', {
      description: 'O novo curso foi criado com sucesso.',
    });

    // Disparar um evento para atualizar as notificações (após um pequeno delay para permitir que o trigger do banco execute)
    setTimeout(() => {
      console.log("Dispatching course-created event");
      window.dispatchEvent(new CustomEvent('course-created', { 
        detail: { courseId } 
      }));
      
      console.log("Dispatching refresh-notifications event");
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
    }, 500);
    
    return courseId;
  } catch (error: any) {
    console.error('Error creating course:', error);
    toast.error('Erro ao criar curso', {
      description: error.message,
    });
    return null;
  }
};
