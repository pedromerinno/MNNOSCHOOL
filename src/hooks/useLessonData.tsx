
import { useCallback, useEffect, useState } from 'react';
import { useLessonFetch } from './lesson/useLessonFetch';
import { useLessonNavigation } from './lesson/useLessonNavigation';
import { useLessonProgress } from './lesson/useLessonProgress';
import { useLessonLikes } from './lesson/useLessonLikes';

export const useLessonData = (lessonId: string | undefined) => {
  const [lastLessonId, setLastLessonId] = useState<string | undefined>(lessonId);
  const { lesson, loading, error, refetch } = useLessonFetch(lessonId);
  const { previousLesson, nextLesson, navigateToLesson } = useLessonNavigation(lessonId, lesson?.course_id);
  const { completed, markLessonCompleted } = useLessonProgress(lessonId, lesson?.course_id, lesson?.completed);
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(lesson?.likes || 0, lesson?.user_liked || false);

  // Detect lesson ID changes and refetch data
  useEffect(() => {
    if (lessonId && lessonId !== lastLessonId) {
      setLastLessonId(lessonId);
      refetch();
    }
  }, [lessonId, lastLessonId, refetch]);

  const handleNavigateToLesson = useCallback((newLessonId: string) => {
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
