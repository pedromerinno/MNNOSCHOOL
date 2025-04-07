
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLessonNavigation = (courseId: string | undefined) => {
  const [processingLesson, setProcessingLesson] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const startLesson = async (lessonId: string) => {
    if (!courseId) return;
    
    try {
      setProcessingLesson(true);
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      // Marcar a aula como iniciada
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: false,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });
      
      if (error) throw error;
      
      // Navegar para a aula
      navigate(`/courses/${courseId}/lessons/${lessonId}`);
      
    } catch (error: any) {
      console.error('Erro ao iniciar aula:', error);
      toast({
        title: 'Erro ao iniciar aula',
        description: error.message || 'Ocorreu um erro ao iniciar a aula',
        variant: 'destructive',
      });
    } finally {
      setProcessingLesson(false);
    }
  };

  return { startLesson, processingLesson };
};
