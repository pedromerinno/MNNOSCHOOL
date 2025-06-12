
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { ExtendedLesson } from '@/hooks/useLessons';

export const useLessonMutations = (courseId: string, onSuccess: () => Promise<void>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateLesson = async (lessonData: Omit<ExtendedLesson, 'id' | 'completed'>) => {
    if (!courseId) return;
    
    setIsSubmitting(true);
    try {
      const lessonDataWithDefaults = {
        ...lessonData,
        course_id: courseId,
        order_index: lessonData.order_index ?? 0,
      };

      console.log("Creating new lesson:", lessonDataWithDefaults);

      const { data, error } = await supabase
        .from('lessons')
        .insert([lessonDataWithDefaults])
        .select()
        .single();

      if (error) throw error;

      console.log("Lesson created successfully:", data);

      toast({
        title: 'Aula criada',
        description: 'A aula foi criada com sucesso',
      });

      await onSuccess();
      
      return data;
    } catch (error: any) {
      console.error("Erro ao criar aula:", error);
      toast({
        title: 'Erro ao criar aula',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLesson = async (lessonId: string, lessonData: Partial<ExtendedLesson>) => {
    setIsSubmitting(true);
    try {
      const updateData: any = {};
      if (lessonData.title !== undefined) updateData.title = lessonData.title;
      if (lessonData.description !== undefined) updateData.description = lessonData.description;
      if (lessonData.content !== undefined) updateData.content = lessonData.content;
      if (lessonData.duration !== undefined) updateData.duration = lessonData.duration;
      if (lessonData.type !== undefined) updateData.type = lessonData.type;
      if (lessonData.order_index !== undefined) updateData.order_index = lessonData.order_index;

      console.log(`Updating lesson ${lessonId}:`, updateData);

      const { error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', lessonId);

      if (error) throw error;

      await onSuccess();

      toast({
        title: 'Aula atualizada',
        description: 'A aula foi atualizada com sucesso',
      });

    } catch (error: any) {
      console.error("Erro ao atualizar aula:", error);
      toast({
        title: 'Erro ao atualizar aula',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReorderLessons = async (lessons: ExtendedLesson[]) => {
    setIsSubmitting(true);
    try {
      console.log("Reordering lessons:", lessons.map(l => ({ id: l.id, order_index: l.order_index })));

      // Update each lesson's order_index individually
      const updatePromises = lessons.map(lesson => 
        supabase
          .from('lessons')
          .update({ order_index: lesson.order_index })
          .eq('id', lesson.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Erro ao reordenar algumas aulas');
      }

      // Only refresh once after all updates are complete
      await onSuccess();

      toast({
        title: 'Aulas reordenadas',
        description: 'A ordem das aulas foi atualizada com sucesso',
      });

    } catch (error: any) {
      console.error("Erro ao reordenar aulas:", error);
      toast({
        title: 'Erro ao reordenar aulas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      console.log(`Deleting lesson ${lessonId}`);
      
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      await onSuccess();
      
      toast({
        title: 'Aula excluída',
        description: 'A aula foi excluída com sucesso',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir aula',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    isSubmitting,
    handleCreateLesson,
    handleUpdateLesson,
    handleReorderLessons,
    handleDeleteLesson,
  };
};
