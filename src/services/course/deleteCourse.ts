
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Deletes a course by ID
 */
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  if (!courseId) {
    toast.error('Erro ao excluir curso', {
      description: 'ID do curso não fornecido',
    });
    return false;
  }

  try {
    console.log(`Attempting to delete course with ID: ${courseId}`);
    
    // First delete all related course company relations
    const { error: relationsError } = await supabase
      .from('company_courses')
      .delete()
      .eq('course_id', courseId);
    
    if (relationsError) {
      console.error('Error deleting course relations:', relationsError);
      throw relationsError;
    }
    
    // Then delete the course itself
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;

    toast.success('Curso excluído', {
      description: 'O curso foi excluído com sucesso.',
    });

    // Dispatch an event to notify any listeners
    window.dispatchEvent(new CustomEvent('course-deleted', { 
      detail: { courseId } 
    }));

    return true;
  } catch (error: any) {
    console.error('Error deleting course:', error);
    toast.error('Erro ao excluir curso', {
      description: error.message || 'Ocorreu um erro ao excluir o curso',
    });
    return false;
  }
};
