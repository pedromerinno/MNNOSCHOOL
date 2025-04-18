
import { useEffect, useCallback, useRef } from 'react';
import { useLessonFetch } from './lesson/useLessonFetch';
import { useLessonNavigation } from './lesson/useLessonNavigation';
import { useLessonProgress } from './lesson/useLessonProgress';
import { useLessonLikes } from './lesson/useLessonLikes';

export const useLessonData = (lessonId: string | undefined) => {
  const { lesson, setLesson, loading, error } = useLessonFetch(lessonId);
  const { previousLesson, nextLesson, navigateToLesson } = useLessonNavigation(lessonId, lesson?.course_id);
  const { completed, markLessonCompleted } = useLessonProgress(lessonId, lesson?.course_id, lesson?.completed);
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(Math.floor(Math.random() * 10), false);
  const syncedRef = useRef(false);

  // Sincronizar o estado de completed com o componente principal apenas quando necessário
  useEffect(() => {
    // Só atualizamos se o lesson existe e o estado completed difere do estado atual da lição
    if (lesson && completed !== lesson.completed && syncedRef.current) {
      setLesson(prev => prev ? { ...prev, completed } : null);
    }
    
    // Marcamos que já passou pelo primeiro ciclo de sincronização
    syncedRef.current = true;
  }, [completed, lesson, setLesson]);

  return { 
    lesson, 
    loading, 
    error, 
    markLessonCompleted,
    previousLesson,
    nextLesson,
    navigateToLesson,
    likes,
    userLiked,
    toggleLikeLesson
  };
};
