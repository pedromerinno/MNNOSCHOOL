
import { useCallback, useEffect, useState, useRef } from 'react';
import { useLessonFetch } from './useLessonFetch';
import { useLessonProgress } from './useLessonProgress';
import { useLessonLikes } from './useLessonLikes';

// Cache em memória melhorado com localStorage backup
const lessonCache = new Map<string, any>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
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
  
  console.log('🔧 useLessonDataOptimized: Hook chamado com lessonId:', lessonId);
  
  // Verificar cache primeiro
  const getCachedLesson = useCallback((id: string) => {
    return getCachedData(id);
  }, []);

  // Usar cache imediatamente se disponível
  useEffect(() => {
    if (lessonId) {
      const cached = getCachedLesson(lessonId);
      if (cached) {
        console.log('📦 useLessonDataOptimized: Encontrou cache para:', lessonId);
        setCachedLesson({ ...cached }); // Clone para evitar mutações
        setIsFromCache(true);
      } else {
        console.log('❌ useLessonDataOptimized: Sem cache para:', lessonId);
        setIsFromCache(false);
        setCachedLesson(null);
      }
    }
  }, [lessonId, getCachedLesson]);

  // Use os hooks apenas quando necessário
  const shouldFetch = currentLessonId && (!isFromCache || !cachedLesson);
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

  // Cache da aula quando carregada
  useEffect(() => {
    if (lesson && currentLessonId && !loading) {
      console.log('💾 useLessonDataOptimized: Salvando cache para:', currentLessonId);
      setCachedData(currentLessonId, lesson);
      
      // Atualizar cachedLesson apenas se for diferente
      if (!cachedLesson || JSON.stringify(cachedLesson) !== JSON.stringify(lesson)) {
        setCachedLesson({ ...lesson });
      }
    }
  }, [lesson, currentLessonId, loading, cachedLesson]);

  // Update current lesson ID quando o prop muda
  useEffect(() => {
    if (lessonId && lessonId !== currentLessonId) {
      console.log('🔄 useLessonDataOptimized: Mudando lessonId de', currentLessonId, 'para', lessonId);
      setCurrentLessonId(lessonId);
    }
  }, [lessonId, currentLessonId]);

  // Refresh que limpa cache seletivamente
  const refreshLessonData = useCallback(() => {
    if (currentLessonId) {
      console.log('🔄 useLessonDataOptimized: Limpando cache para:', currentLessonId);
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

  // Atualizar cache quando receber eventos externos
  useEffect(() => {
    const handleLessonUpdated = (event: CustomEvent) => {
      const { lessonId: updatedLessonId, data } = event.detail;
      
      if (updatedLessonId === currentLessonId && data) {
        console.log('🔄 useLessonDataOptimized: Atualizando cache via evento:', updatedLessonId);
        setCachedData(updatedLessonId, data);
        setCachedLesson({ ...data });
      }
    };

    window.addEventListener('lesson-updated', handleLessonUpdated as EventListener);
    
    return () => {
      window.removeEventListener('lesson-updated', handleLessonUpdated as EventListener);
    };
  }, [currentLessonId]);

  // Usar lesson do cache ou fetched
  const currentLesson = cachedLesson || lesson;

  return { 
    lesson: currentLesson, 
    loading: loading && !cachedLesson, 
    error, 
    markLessonCompleted,
    navigateToLesson: () => {}, // Não usado mais
    likes,
    userLiked,
    toggleLikeLesson,
    completed,
    refreshLessonData,
    isFromCache: !!cachedLesson
  };
};
