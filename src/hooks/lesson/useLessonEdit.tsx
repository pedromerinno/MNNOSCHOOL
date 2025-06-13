
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLessonEdit = (lessonId: string | undefined) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateLessonField = async (field: string, value: string) => {
    if (!lessonId) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ [field]: value })
        .eq('id', lessonId);

      if (error) throw error;

      toast.success('Aula atualizada com sucesso');
      
      // Disparar evento de atualização imediatamente
      window.dispatchEvent(new CustomEvent('lesson-field-updated', {
        detail: { 
          lessonId,
          field,
          value
        }
      }));

    } catch (error: any) {
      console.error('Error updating lesson:', error);
      toast.error('Erro ao atualizar aula: ' + error.message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateLessonField,
    isUpdating
  };
};
