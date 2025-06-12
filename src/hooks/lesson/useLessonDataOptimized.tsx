
import { useCallback, useEffect, useState, useRef } from 'react';
import { useLessonFetch } from './useLessonFetch';
import { useLessonProgress } from './useLessonProgress';
import { useLessonLikes } from './useLessonLikes';
import { useNavigate, useLocation } from 'react-router-dom';

// Cache em memória melhorado com localStorage backup
const lessonCache = new Map<string, any>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
const STORAGE_KEY = 'lesson-cache';

// Funções de cache com localStorage
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
  
  // Salvar em localStorage
  try {
    localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('Error writing to localStorage:', error);
  }
};

export const useLessonDataOptimized = (lessonId: string | undefined) => {
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(lessonId);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cachedLesson, setCachedLesson] = useState<any>(null);
  const [prefetchedData, setPrefetchedData] = useState<Map<string, any>>(new Map());
  const location = useLocation();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Verificar cache primeiro - otimizado com localStorage
  const getCachedLesson = useCallback((id: string) => {
    return getCachedData(id);
  }, []);

  // Prefetch de dados relacionados
  const prefetchRelatedData = useCallback(async (lesson: any) => {
    if (!lesson?.course_lessons) return;
    
    // Prefetch próximas 2 aulas
    const currentIndex = lesson.course_lessons.findIndex((l: any) => l.id === lesson.id);
    const nextLessons = lesson.course_lessons.slice(currentIndex + 1, currentIndex + 3);
    
    nextLessons.forEach((nextLesson: any) => {
      if (!getCachedData(nextLesson.id)) {
        // Simular prefetch (pode ser implementado com fetch real se necessário)
        setTimeout(() => {
          setPrefetchedData(prev => new Map(prev.set(nextLesson.id, { prefetched: true })));
        }, 100);
      }
    });
  }, []);

  // Usar cache imediatamente se disponível
  useEffect(() => {
    if (lessonId) {
      const cached = getCachedLesson(lessonId);
      if (cached) {
        console.log('Loading lesson from cache:', lessonId);
        setCachedLesson(cached);
        setIsFromCache(true);
        
        // Prefetch dados relacionados em background
        prefetchRelatedData(cached);
      } else {
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
    
    // Verificar se dados já estão prefetched
    const prefetched = prefetchedData.get(newLessonId);
    if (prefetched) {
      console.log('Using prefetched data for lesson:', newLessonId);
    }
    
    if ((cachedLesson || lesson)?.course_id) {
      navigate(`/courses/${(cachedLesson || lesson).course_id}/lessons/${newLessonId}`, { 
        replace: true,
        state: { preventRefresh: true, prefetched } 
      });
    }
  }, [navigate, cachedLesson, lesson, currentLessonId, prefetchedData]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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
