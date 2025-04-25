
import { useCallback, useEffect, useState } from 'react';
import { useLessonFetch } from './lesson/useLessonFetch';
import { useLessonNavigation } from './lesson/useLessonNavigation';
import { useLessonProgress } from './lesson/useLessonProgress';
import { useLessonLikes } from './lesson/useLessonLikes';
import { useNavigate, useLocation } from 'react-router-dom';

export const useLessonData = (lessonId: string | undefined) => {
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(lessonId);
  const location = useLocation();
  
  // Use the currentLessonId in hooks to ensure they update when the lesson changes
  const { lesson, loading, error, refetch } = useLessonFetch(currentLessonId);
  const { previousLesson, nextLesson, navigateToLesson } = useLessonNavigation(currentLessonId, lesson?.course_id);
  const { completed, markLessonCompleted } = useLessonProgress(currentLessonId, lesson?.course_id, lesson?.completed);
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(lesson?.likes || 0, lesson?.user_liked || false);
  const navigate = useNavigate();

  // Update current lesson ID when the prop changes
  useEffect(() => {
    if (lessonId && lessonId !== currentLessonId) {
      setCurrentLessonId(lessonId);
    }
  }, [lessonId, currentLessonId]);
  
  // Better navigation without full page refresh
  const handleNavigateToLesson = useCallback((newLessonId: string) => {
    if (newLessonId === currentLessonId) return;
    
    if (lesson?.course_id) {
      // Prevent default navigation behavior
      const preventRefresh = true;
      
      // Update URL without page refresh
      navigate(`/courses/${lesson.course_id}/lessons/${newLessonId}`, { 
        replace: true, // Use replace to prevent browser history buildup when navigating lessons
        state: { preventRefresh } 
      });
      
      // Update the current lesson ID to trigger data refetch
      setCurrentLessonId(newLessonId);
    }
  }, [navigate, lesson?.course_id, currentLessonId]);

  // Prevent unwanted refetches
  useEffect(() => {
    const preventRefresh = location.state && (location.state as any).preventRefresh;
    
    // Only refetch if explicitly allowed
    if (!preventRefresh && currentLessonId) {
      console.log("Regular navigation detected, fetching lesson data");
      refetch();
    }
  }, [location.pathname, refetch, currentLessonId]);

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
