
import { useCallback, useEffect, useState } from 'react';
import { useLessonFetch } from './lesson/useLessonFetch';
import { useLessonNavigation } from './lesson/useLessonNavigation';
import { useLessonProgress } from './lesson/useLessonProgress';
import { useLessonLikes } from './lesson/useLessonLikes';
import { useNavigate } from 'react-router-dom';

export const useLessonData = (lessonId: string | undefined) => {
  const [lastLessonId, setLastLessonId] = useState<string | undefined>(lessonId);
  const { lesson, loading, error, refetch } = useLessonFetch(lessonId);
  const { previousLesson, nextLesson, navigateToLesson } = useLessonNavigation(lessonId, lesson?.course_id);
  const { completed, markLessonCompleted } = useLessonProgress(lessonId, lesson?.course_id, lesson?.completed);
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(lesson?.likes || 0, lesson?.user_liked || false);
  const navigate = useNavigate();

  // Detect lesson ID changes and refetch data
  useEffect(() => {
    if (lessonId && lessonId !== lastLessonId) {
      setLastLessonId(lessonId);
      refetch();
    }
  }, [lessonId, lastLessonId, refetch]);

  const handleNavigateToLesson = useCallback((newLessonId: string) => {
    if (lesson?.course_id) {
      // Update URL without page refresh
      navigate(`/courses/${lesson.course_id}/lessons/${newLessonId}`, { 
        replace: false, 
        state: { noRefresh: true } 
      });
      
      // Update the current lesson ID to trigger a data refetch
      setLastLessonId(newLessonId);
      refetch();
    }
  }, [navigate, lesson?.course_id, refetch]);

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
