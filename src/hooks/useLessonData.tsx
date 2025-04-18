
import { useEffect, useCallback } from 'react';
import { useLessonFetch } from './lesson/useLessonFetch';
import { useLessonNavigation } from './lesson/useLessonNavigation';
import { useLessonProgress } from './lesson/useLessonProgress';
import { useLessonLikes } from './lesson/useLessonLikes';

export const useLessonData = (lessonId: string | undefined) => {
  const { lesson, setLesson, loading, error } = useLessonFetch(lessonId);
  const { previousLesson, nextLesson, navigateToLesson } = useLessonNavigation(lessonId, lesson?.course_id);
  const { completed, markLessonCompleted } = useLessonProgress(lessonId, lesson?.course_id, lesson?.completed);
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(Math.floor(Math.random() * 10), false);

  // Sincronizar o estado de completed com o componente principal
  // Usando useCallback para evitar loop infinito
  const updateLessonCompleted = useCallback(() => {
    if (lesson && completed !== lesson.completed) {
      setLesson(prev => prev ? { ...prev, completed } : null);
    }
  }, [completed, lesson?.id, setLesson]); // Adicionando lesson?.id como dependência

  // Use o callback em um useEffect separado com dependências corretas
  useEffect(() => {
    updateLessonCompleted();
  }, [updateLessonCompleted]);

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
