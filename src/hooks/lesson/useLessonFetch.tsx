
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lesson } from '@/components/courses/CourseLessonList';

export const useLessonFetch = (lessonId: string | undefined) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchLesson = useCallback(async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch the current user
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      // Buscar os dados da aula incluindo a descrição e título do curso
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select(`
          *,
          courses (
            description,
            title
          )
        `)
        .eq('id', lessonId)
        .single();
      
      if (lessonError) {
        throw lessonError;
      }

      // Buscar todas as aulas do mesmo curso
      const { data: courseLessons, error: courseLessonsError } = await supabase
        .from('lessons')
        .select('id, title, type, duration, completed, order_index, content')
        .eq('course_id', lessonData.course_id)
        .order('order_index', { ascending: true });
        
      if (courseLessonsError) {
        console.error('Erro ao buscar aulas do curso:', courseLessonsError);
      }
      
      // Buscar o progresso da aula para este usuário
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('completed')
        .eq('lesson_id', lessonId)
        .eq('user_id', userId || '')
        .maybeSingle();
      
      if (progressError) {
        console.error('Erro ao buscar progresso da aula:', progressError);
      }
      
      // Buscar progresso de todas as aulas do curso para marcar como concluídas na playlist
      const { data: lessonsProgressData, error: lessonsProgressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', userId || '')
        .in('lesson_id', courseLessons?.map(lesson => lesson.id) || []);

      if (lessonsProgressError) {
        console.error('Erro ao buscar progresso das aulas:', lessonsProgressError);
      }

      // Marcar as aulas como concluídas na lista
      const lessonsWithProgress = courseLessons?.map(lesson => ({
        ...lesson,
        completed: lessonsProgressData?.some(
          progress => progress.lesson_id === lesson.id && progress.completed
        ) || false
      })) || [];
      
      // Como não existe uma tabela real de likes, estamos simulando um valor
      // Em produção, você substituiria isso pela contagem real de likes
      const likesCount = Math.floor(Math.random() * 50) + 1; // Simulação - entre 1 e 50 likes
      const userHasLiked = false; // Simulação - por padrão o usuário não deu like
      
      const lessonWithCourseDescription = {
        ...lessonData,
        course_description: lessonData.courses?.description || null,
        course_title: lessonData.courses?.title || null,
        completed: progressData?.completed || false,
        course_lessons: lessonsWithProgress,
        likes: likesCount,
        user_liked: userHasLiked
      } as Lesson;
      
      setLesson(lessonWithCourseDescription);
      
      // Update last access
      if (userId) {
        const { error: updateError } = await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: userId,
            lesson_id: lessonId,
            completed: progressData?.completed || false,
            last_accessed: new Date().toISOString()
          }, { 
            onConflict: 'user_id,lesson_id'
          });
        
        if (updateError) {
          console.error('Erro ao atualizar último acesso:', updateError);
        }
      }
      
    } catch (error: any) {
      console.error('Erro ao buscar aula:', error);
      setError(error);
      toast({
        title: 'Erro ao carregar aula',
        description: error.message || 'Ocorreu um erro ao buscar os dados da aula',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [lessonId, toast]);

  // Effect para buscar dados iniciais
  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return { 
    lesson, 
    setLesson, 
    loading, 
    error,
    refetch: fetchLesson
  };
};
