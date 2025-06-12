
import { useCallback, useEffect, useState, useRef } from 'react';
import { useLessonFetch } from './useLessonFetch';
import { useLessonProgress } from './useLessonProgress';
import { useLessonLikes } from './useLessonLikes';
import { useNavigate, useLocation } from 'react-router-dom';

// Cache em memória para otimizar carregamento
const lessonCache = new Map<string, any>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export const useLessonDataOptimized = (lessonId: string | undefined) => {
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(lessonId);
  const [isFromCache, setIsFromCache] = useState(false);
  const location = useLocation();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Verificar cache primeiro
  const getCachedLesson = useCallback((id: string) => {
    const cached = lessonCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Use os hooks existentes mas com otimizações
  const { lesson, loading, error, refetch } = useLessonFetch(currentLessonId);
  const { completed, markLessonCompleted } = useLessonProgress(currentLessonId, lesson?.course_id, lesson?.completed);
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(lesson?.likes || 0, lesson?.user_liked || false);
  const navigate = useNavigate();

  // Cache da aula quando carregada
  useEffect(() => {
    if (lesson && currentLessonId && !loading) {
      lessonCache.set(currentLessonId, {
        data: lesson,
        timestamp: Date.now()
      });
    }
  }, [lesson, currentLessonId, loading]);

  // Update current lesson ID when the prop changes
  useEffect(() => {
    if (lessonId && lessonId !== currentLessonId) {
      // Cancelar requisições anteriores
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Verificar cache primeiro
      const cached = getCachedLesson(lessonId);
      if (cached) {
        setIsFromCache(true);
        setCurrentLessonId(lessonId);
        return;
      }
      
      setIsFromCache(false);
      setCurrentLessonId(lessonId);
    }
  }, [lessonId, currentLessonId, getCachedLesson]);
  
  // Navegação otimizada
  const handleNavigateToLesson = useCallback((newLessonId: string) => {
    if (newLessonId === currentLessonId) return;
    
    if (lesson?.course_id) {
      // Pré-carregar a próxima aula se estiver em cache
      const nextLesson = getCachedLesson(newLessonId);
      
      navigate(`/courses/${lesson.course_id}/lessons/${newLessonId}`, { 
        replace: true,
        state: { preventRefresh: true, fromCache: !!nextLesson } 
      });
      
      setCurrentLessonId(newLessonId);
    }
  }, [navigate, lesson?.course_id, currentLessonId, getCachedLesson]);

  // Evitar refetches desnecessários
  useEffect(() => {
    const preventRefresh = location.state && (location.state as any).preventRefresh;
    const fromCache = location.state && (location.state as any).fromCache;
    
    if (!preventRefresh && !fromCache && currentLessonId && !isFromCache) {
      console.log("Regular navigation detected, fetching lesson data");
      refetch();
    }
  }, [location.pathname, refetch, currentLessonId, isFromCache]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { 
    lesson, 
    loading: loading && !isFromCache, 
    error, 
    markLessonCompleted,
    navigateToLesson: handleNavigateToLesson,
    likes,
    userLiked,
    toggleLikeLesson,
    completed,
    refreshLessonData: refetch,
    isFromCache
  };
};
