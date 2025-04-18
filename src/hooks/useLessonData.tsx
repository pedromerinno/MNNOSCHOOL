
import { useCallback } from 'react';
import { useLessonFetch } from './lesson/useLessonFetch';
import { useLessonNavigation } from './lesson/useLessonNavigation';
import { useLessonProgress } from './lesson/useLessonProgress';
import { useLessonLikes } from './lesson/useLessonLikes';

export const useLessonData = (lessonId: string | undefined) => {
  const { lesson, loading, error } = useLessonFetch(lessonId);
  const { previousLesson, nextLesson, navigateToLesson } = useLessonNavigation(lessonId, lesson?.course_id);
  const { completed, markLessonCompleted } = useLessonProgress(lessonId, lesson?.course_id, lesson?.completed);
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(Math.floor(Math.random() * 10), false);

  // Memos e Callbacks são importantes para evitar renderizações desnecessárias
  const handleMarkCompleted = useCallback(() => {
    markLessonCompleted();
  }, [markLessonCompleted]);

  return { 
    lesson, 
    loading, 
    error, 
    markLessonCompleted: handleMarkCompleted,
    previousLesson,
    nextLesson,
    navigateToLesson,
    likes,
    userLiked,
    toggleLikeLesson,
    completed
  };
};
