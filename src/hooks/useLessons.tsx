import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/components/courses/CourseLessonList';

export interface ExtendedLesson extends Omit<Lesson, 'content' | 'course_id'> {
  content?: string;
  course_id?: string;
}

export const useLessons = (courseId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<ExtendedLesson | undefined>(undefined);
  const { toast } = useToast();

  const fetchLessons = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      console.log("Aulas carregadas com sucesso:", data?.length || 0);
      setLessons(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar aulas:", error);
      toast({
        title: 'Erro ao carregar aulas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLesson = async (lessonData: Omit<ExtendedLesson, 'id' | 'completed'>) => {
    if (!courseId) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([{
          ...lessonData,
          course_id: courseId,
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Aula criada',
        description: 'A aula foi criada com sucesso',
      });

      // Atualizar a lista de aulas
      fetchLessons();
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
      // Create an update object only with properties that exist in lessonData
      const updateData: any = {};
      if (lessonData.title !== undefined) updateData.title = lessonData.title;
      if (lessonData.description !== undefined) updateData.description = lessonData.description;
      if (lessonData.content !== undefined) updateData.content = lessonData.content;
      if (lessonData.duration !== undefined) updateData.duration = lessonData.duration;
      if (lessonData.type !== undefined) updateData.type = lessonData.type;
      if (lessonData.order_index !== undefined) updateData.order_index = lessonData.order_index;

      const { error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', lessonId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Aula atualizada',
        description: 'A aula foi atualizada com sucesso',
      });

      // Atualizar a lista de aulas
      fetchLessons();
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

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Aula excluída',
        description: 'A aula foi excluída com sucesso',
      });

      // Atualizar a lista de aulas
      fetchLessons();
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
    lessons,
    isLoading,
    selectedLesson,
    setSelectedLesson,
    isSubmitting,
    fetchLessons,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
  };
};
