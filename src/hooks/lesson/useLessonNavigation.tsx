
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from 'react-router-dom';

type LessonNavigation = {
  id: string;
  title: string;
  type: string;
};

export const useLessonNavigation = (lessonId: string | undefined, courseId: string | undefined) => {
  const [previousLesson, setPreviousLesson] = useState<LessonNavigation | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonNavigation | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const { courseId: urlCourseId } = useParams<{ courseId: string }>();
  const effectiveCourseId = courseId || urlCourseId;

  // Fetch navigation lessons (previous and next)
  useEffect(() => {
    const fetchNavigationLessons = async () => {
      if (!lessonId || !effectiveCourseId) return;
      
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
          .eq('course_id', effectiveCourseId)
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
          .eq('course_id', effectiveCourseId)
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
    
    if (!isNavigating) {
      fetchNavigationLessons();
    }
  }, [lessonId, effectiveCourseId, isNavigating]);

  const navigateToLesson = useCallback((newLessonId: string) => {
    if (!effectiveCourseId) return;
    
    setIsNavigating(true);
    
    // Update URL without full page refresh
    navigate(`/courses/${effectiveCourseId}/lessons/${newLessonId}`, { 
      replace: false,
      state: { noRefresh: true }
    });
    
    // Reset navigation state after URL update
    setTimeout(() => setIsNavigating(false), 100);
  }, [effectiveCourseId, navigate]);

  return { previousLesson, nextLesson, navigateToLesson };
};
