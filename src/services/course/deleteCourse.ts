
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Deletes a course by ID
 */
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;

    toast.success('Curso excluído', {
      description: 'O curso foi excluído com sucesso.',
    });

    return true;
  } catch (error: any) {
    toast.error('Erro ao excluir curso', {
      description: error.message,
    });
    return false;
  }
};
