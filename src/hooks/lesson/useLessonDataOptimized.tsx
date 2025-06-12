
import { useCallback, useEffect, useState, useRef } from 'react';
import { useLessonFetch } from './useLessonFetch';
import { useLessonProgress } from './useLessonProgress';
import { useLessonLikes } from './useLessonLikes';
import { useNavigate, useLocation } from 'react-router-dom';

// Cache em memória melhorado com TTL mais longo
const lessonCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useLessonDataOptimized = (lessonId: string | undefined) => {
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(lessonId);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cachedLesson, setCachedLesson] = useState<any>(null);
  const location = useLocation();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Verificar cache primeiro - otimizado
  const getCachedLesson = useCallback((id: string) => {
    const cached = lessonCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Usar cache imediatamente se disponível
  useEffect(() => {
    if (lessonId) {
      const cached = getCachedLesson(lessonId);
      if (cached) {
        console.log('Loading lesson from cache:', lessonId);
        setCachedLesson(cached);
        setIsFromCache(true);
      } else {
        setIsFromCache(false);
        setCachedLesson(null);
      }
    }
  }, [lessonId, getCachedLesson]);

  // Use os hooks apenas quando necessário
  const shouldFetch = currentLessonId && !isFromCache;
  const { lesson, loading, error, refetch } = useLessonFetch(shouldFetch ? currentLessonId : undefined);
  const { completed, markLessonCompleted } = useLessonProgress(
    currentLessonId, 
    (cachedLesson || lesson)?.course_id, 
    (cachedLesson || lesson)?.completed
  );
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(
    (cachedLesson || lesson)?.likes || 0, 
    (cachedLesson || lesson)?.user_liked || false
  );
  const navigate = useNavigate();

  // Cache da aula quando carregada
  useEffect(() => {
    if (lesson && currentLessonId && !loading) {
      console.log('Caching lesson:', currentLessonId);
      lessonCache.set(currentLessonId, {
        data: lesson,
        timestamp: Date.now()
      });
      setCachedLesson(lesson);
    }
  }, [lesson, currentLessonId, loading]);

  // Update current lesson ID quando o prop muda
  useEffect(() => {
    if (lessonId && lessonId !== currentLessonId) {
      // Cancelar requisições anteriores
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      setCurrentLessonId(lessonId);
    }
  }, [lessonId, currentLessonId]);
  
  // Navegação otimizada com preload
  const handleNavigateToLesson = useCallback((newLessonId: string) => {
    if (newLessonId === currentLessonId) return;
    
    console.log('Navigating to lesson:', newLessonId);
    
    if ((cachedLesson || lesson)?.course_id) {
      navigate(`/courses/${(cachedLesson || lesson).course_id}/lessons/${newLessonId}`, { 
        replace: true,
        state: { preventRefresh: true } 
      });
    }
  }, [navigate, cachedLesson, lesson, currentLessonId]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Usar lesson do cache ou fetched
  const currentLesson = cachedLesson || lesson;

  return { 
    lesson: currentLesson, 
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
