
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

type LessonNavigation = {
  id: string;
  title: string;
  type: string;
};

export const useLessonNavigation = (lessonId: string | undefined, courseId: string | undefined) => {
  const [previousLesson, setPreviousLesson] = useState<LessonNavigation | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonNavigation | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
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
          .maybeSingle();
        
        if (currentError) throw currentError;
        if (!currentLesson) {
          console.error('Lesson not found');
          return;
        }
        
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
        
        setPreviousLesson(prevData);
        
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
        
        setNextLesson(nextData);
      } catch (error) {
        console.error('Erro ao buscar aulas para navegação:', error);
        toast({
          title: "Erro ao carregar navegação",
          description: "Não foi possível carregar as aulas anterior e próxima",
          variant: "destructive"
        });
      }
    };
    
    if (lessonId && effectiveCourseId) {
      fetchNavigationLessons();
    }
  }, [lessonId, effectiveCourseId, toast]);

  // Simplified navigateToLesson function - actual navigation happens in useLessonData
  const navigateToLesson = useCallback((newLessonId: string) => {
    return newLessonId;
  }, []);

  return { previousLesson, nextLesson, navigateToLesson };
};
