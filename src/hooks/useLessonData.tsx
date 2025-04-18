
import { useCallback, useEffect } from 'react';
import { useLessonFetch } from './lesson/useLessonFetch';
import { useLessonNavigation } from './lesson/useLessonNavigation';
import { useLessonProgress } from './lesson/useLessonProgress';
import { useLessonLikes } from './lesson/useLessonLikes';

export const useLessonData = (lessonId: string | undefined) => {
  const { lesson, loading, error, refetch } = useLessonFetch(lessonId);
  const { previousLesson, nextLesson, navigateToLesson } = useLessonNavigation(lessonId, lesson?.course_id);
  const { completed, markLessonCompleted } = useLessonProgress(lessonId, lesson?.course_id, lesson?.completed);
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(Math.floor(Math.random() * 10), false);

  // Reset state when lessonId changes
  useEffect(() => {
    if (lessonId) {
      refetch();
    }
  }, [lessonId, refetch]);

  const handleNavigateToLesson = useCallback((newLessonId: string) => {
    // Navegamos para a nova aula
    navigateToLesson(newLessonId);
  }, [navigateToLesson]);

  return { 
    lesson, 
    loading, 
    error, 
    markLessonCompleted,
    previousLesson,
    nextLesson,
    navigateToLesson: handleNavigateToLesson,
    likes,
    userLiked,
    toggleLikeLesson,
    completed
  };
};
