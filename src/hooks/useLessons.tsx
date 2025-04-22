import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/components/courses/CourseLessonList';

export interface ExtendedLesson extends Omit<Lesson, 'content'> {
  content?: string;
}

export const useLessons = (courseId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<ExtendedLesson | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    if (!courseId) return;

    // Set up real-time subscription
    const channel = supabase
      .channel('public:lessons')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setLessons(current => [...current, payload.new as Lesson].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
          } else if (payload.eventType === 'DELETE') {
            setLessons(current => current.filter(lesson => lesson.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setLessons(current => 
              current.map(lesson => 
                lesson.id === payload.new.id ? payload.new as Lesson : lesson
              ).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            );
          }
        }
      )
      .subscribe();

    // Initial fetch of lessons
    fetchLessons();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId]);

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
      const lessonDataWithDefaults = {
        ...lessonData,
        course_id: courseId,
        order_index: lessonData.order_index ?? 0,
      };

      const { data, error } = await supabase
        .from('lessons')
        .insert([lessonDataWithDefaults])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Aula criada',
        description: 'A aula foi criada com sucesso',
      });

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

      const { error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', lessonId);

      if (error) throw error;

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

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

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
