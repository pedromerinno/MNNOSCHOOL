
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLessonProgress = (lessonId: string | undefined, courseId: string | undefined, initialCompleted: boolean = false) => {
  const [completed, setCompleted] = useState(initialCompleted);
  const { toast } = useToast();

  const updateCourseProgress = async (courseId: string, userId: string) => {
    try {
      // Buscar todas as aulas do curso
      const { data: courseLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);
      
      if (lessonsError) throw lessonsError;
      
      // Buscar todas as aulas concluídas deste curso
      const { data: completedLessons, error: completedError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true);
      
      if (completedError) throw completedError;
      
      // Calcular o progresso
      const totalLessons = courseLessons.length;
      const completedCount = completedLessons.filter(progress => 
        courseLessons.some(lesson => lesson.id === progress.lesson_id)
      ).length;
      
      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      const isCompleted = progress === 100;
      
      // Atualizar o progresso do curso
      const { error: updateError } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          progress,
          completed: isCompleted,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        });
      
      if (updateError) throw updateError;
      
    } catch (error) {
      console.error('Erro ao atualizar progresso do curso:', error);
    }
  };

  const markLessonCompleted = async () => {
    if (!lessonId || !courseId) return;
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      // Marcar a aula como concluída
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });
      
      if (error) throw error;
      
      // Atualizar o estado local
      setCompleted(true);
      
      // Atualizar o progresso do curso
      await updateCourseProgress(courseId, userId);
      
      toast({
        title: 'Aula concluída',
        description: 'Seu progresso foi salvo com sucesso',
      });
      
    } catch (error: any) {
      console.error('Erro ao marcar aula como concluída:', error);
      toast({
        title: 'Erro ao salvar progresso',
        description: error.message || 'Ocorreu um erro ao marcar a aula como concluída',
        variant: 'destructive',
      });
    }
  };

  return { completed, markLessonCompleted };
};
