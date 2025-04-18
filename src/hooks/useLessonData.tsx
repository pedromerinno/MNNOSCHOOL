
import { useCallback } from 'react';
import { useLessonFetch } from './lesson/useLessonFetch';
import { useLessonNavigation } from './lesson/useLessonNavigation';
import { useLessonProgress } from './lesson/useLessonProgress';
import { useLessonLikes } from './lesson/useLessonLikes';

export const useLessonData = (lessonId: string | undefined) => {
  const { lesson, loading, error, refetch } = useLessonFetch(lessonId);
  const { previousLesson, nextLesson, navigateToLesson } = useLessonNavigation(lessonId, lesson?.course_id);
  const { completed, markLessonCompleted } = useLessonProgress(lessonId, lesson?.course_id, lesson?.completed);
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(Math.floor(Math.random() * 10), false);

  const handleNavigateToLesson = useCallback((newLessonId: string) => {
    // Primeiro navegamos
    navigateToLesson(newLessonId);
    // Então forçamos um refetch dos dados
    refetch();
  }, [navigateToLesson, refetch]);

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
