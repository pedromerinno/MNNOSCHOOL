
import { useCallback, useEffect, useState, useRef } from 'react';
import { useLessonFetch } from './useLessonFetch';
import { useLessonProgress } from './useLessonProgress';
import { useLessonLikes } from './useLessonLikes';
import { useNavigate, useLocation } from 'react-router-dom';

// Cache em memória melhorado com localStorage backup
const lessonCache = new Map<string, any>();
const CACHE_DURATION = 10 * 60 * 1000; // Reduzido para 10 minutos
const STORAGE_KEY = 'lesson-cache';

// Funções de cache com localStorage otimizadas
const getCachedData = (key: string) => {
  // Primeiro verifica o cache em memória
  const memoryCache = lessonCache.get(key);
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    return memoryCache.data;
  }

  // Se não encontrou em memória, verifica localStorage
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        // Repovoar cache em memória
        lessonCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
  }
  
  return null;
};

const setCachedData = (key: string, data: any) => {
  const cacheEntry = {
    data,
    timestamp: Date.now()
  };
  
  // Salvar em memória
  lessonCache.set(key, cacheEntry);
  
  // Salvar em localStorage de forma assíncrona
  setTimeout(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
    }
  }, 0);
};

export const useLessonDataOptimized = (lessonId: string | undefined) => {
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(lessonId);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cachedLesson, setCachedLesson] = useState<any>(null);
  const [prefetchedData, setPrefetchedData] = useState<Map<string, any>>(new Map());
  const location = useLocation();
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Verificar cache primeiro - otimizado com localStorage
  const getCachedLesson = useCallback((id: string) => {
    return getCachedData(id);
  }, []);

  // Prefetch de dados relacionados - otimizado
  const prefetchRelatedData = useCallback(async (lesson: any) => {
    if (!lesson?.course_lessons) return;
    
    // Prefetch próximas 2 aulas e anteriores 1 aula
    const currentIndex = lesson.course_lessons.findIndex((l: any) => l.id === lesson.id);
    const nextLessons = lesson.course_lessons.slice(currentIndex + 1, currentIndex + 3);
    const prevLessons = lesson.course_lessons.slice(Math.max(0, currentIndex - 1), currentIndex);
    
    [...prevLessons, ...nextLessons].forEach((relatedLesson: any, index: number) => {
      if (!getCachedData(relatedLesson.id)) {
        // Prefetch com delay menor
        setTimeout(() => {
          setPrefetchedData(prev => new Map(prev.set(relatedLesson.id, { 
            prefetched: true, 
            priority: index + 1 
          })));
        }, index * 30);
      }
    });
  }, []);

  // Usar cache imediatamente se disponível
  useEffect(() => {
    if (lessonId) {
      const cached = getCachedLesson(lessonId);
      if (cached) {
        console.log('Loading lesson from cache (instant):', lessonId);
        setCachedLesson(cached);
        setIsFromCache(true);
        
        // Prefetch dados relacionados em background
        prefetchRelatedData(cached);
      } else {
        console.log('No cache found, will fetch:', lessonId);
        setIsFromCache(false);
        setCachedLesson(null);
      }
    }
  }, [lessonId, getCachedLesson, prefetchRelatedData]);

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

  // Cache da aula quando carregada com localStorage
  useEffect(() => {
    if (lesson && currentLessonId && !loading) {
      console.log('Caching lesson with localStorage:', currentLessonId);
      setCachedData(currentLessonId, lesson);
      setCachedLesson(lesson);
      
      // Prefetch dados relacionados
      prefetchRelatedData(lesson);
    }
  }, [lesson, currentLessonId, loading, prefetchRelatedData]);

  // Update current lesson ID quando o prop muda - otimizado
  useEffect(() => {
    if (lessonId && lessonId !== currentLessonId) {
      // Cancelar requisições anteriores
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      setCurrentLessonId(lessonId);
    }
  }, [lessonId, currentLessonId]);
  
  // Navegação simplificada e corrigida
  const handleNavigateToLesson = useCallback((newLessonId: string) => {
    console.log('=== NAVIGATION ATTEMPT ===');
    console.log('Target lesson ID:', newLessonId);
    console.log('Current lesson ID:', currentLessonId);
    
    const courseId = (cachedLesson || lesson)?.course_id;
    console.log('Course ID:', courseId);
    
    if (!courseId) {
      console.error('No course ID available for navigation');
      return;
    }
    
    // Navegação direta e simples
    const navigationPath = `/courses/${courseId}/lessons/${newLessonId}`;
    console.log('Navigating to:', navigationPath);
    
    try {
      navigate(navigationPath, { replace: false });
      console.log('Navigation called successfully');
    } catch (error) {
      console.error('Navigation error:', error);
    }
    
    console.log('=========================');
  }, [navigate, cachedLesson, lesson, currentLessonId]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Refresh otimizado que limpa cache
  const refreshLessonData = useCallback(() => {
    if (currentLessonId) {
      // Limpar cache
      lessonCache.delete(currentLessonId);
      try {
        localStorage.removeItem(`${STORAGE_KEY}-${currentLessonId}`);
      } catch (error) {
        console.warn('Error clearing localStorage:', error);
      }
      
      setIsFromCache(false);
      setCachedLesson(null);
      
      // Trigger refetch
      if (refetch) {
        refetch();
      }
    }
  }, [currentLessonId, refetch]);

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
    refreshLessonData,
    isFromCache
  };
};
