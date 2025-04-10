
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

type LessonNavigation = {
  id: string;
  title: string;
  type: string;
};

export const useLessonNavigation = (lessonId: string | undefined, courseId: string | undefined) => {
  const [previousLesson, setPreviousLesson] = useState<LessonNavigation | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonNavigation | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNavigationLessons = async () => {
      if (!lessonId || !courseId) return;

      try {
        // Buscar dados da lição atual para obter order_index
        const { data: currentLesson, error: currentError } = await supabase
          .from('lessons')
          .select('order_index')
          .eq('id', lessonId)
          .single();
        
        if (currentError) throw currentError;
        
        const currentOrderIndex = currentLesson.order_index;
        
        // Buscar aula anterior
        const { data: prevData, error: prevError } = await supabase
          .from('lessons')
          .select('id, title, type')
          .eq('course_id', courseId)
          .lt('order_index', currentOrderIndex)
          .order('order_index', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (prevError) throw prevError;
        
        setPreviousLesson(prevData || null);
        
        // Buscar próxima aula
        const { data: nextData, error: nextError } = await supabase
          .from('lessons')
          .select('id, title, type')
          .eq('course_id', courseId)
          .gt('order_index', currentOrderIndex)
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle();
        
        if (nextError) throw nextError;
        
        setNextLesson(nextData || null);
      } catch (error) {
        console.error('Erro ao buscar aulas para navegação:', error);
      }
    };
    
    fetchNavigationLessons();
  }, [lessonId, courseId]);

  const navigateToLesson = (lessonId: string) => {
    if (!courseId) return;
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  return { previousLesson, nextLesson, navigateToLesson };
};
