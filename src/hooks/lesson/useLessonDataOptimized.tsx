
import { useCallback, useEffect, useState } from 'react';
import { useLessonFetch } from './useLessonFetch';
import { useLessonProgress } from './useLessonProgress';
import { useLessonLikes } from './useLessonLikes';

// Cache em memória simples e rápido
const lessonCache = new Map<string, any>();

export const useLessonDataOptimized = (lessonId: string | undefined) => {
  const [cachedLesson, setCachedLesson] = useState<any>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  
  console.log('🔧 useLessonDataOptimized: Hook chamado com lessonId:', lessonId);
  
  // Verificar cache primeiro
  useEffect(() => {
    if (lessonId) {
      const cached = lessonCache.get(lessonId);
      if (cached) {
        console.log('📦 useLessonDataOptimized: Cache hit para:', lessonId);
        setCachedLesson(cached);
        setIsFromCache(true);
      } else {
        console.log('❌ useLessonDataOptimized: Cache miss para:', lessonId);
        setIsFromCache(false);
        setCachedLesson(null);
      }
    }
  }, [lessonId]);

  // Fetch apenas se não tiver cache
  const shouldFetch = lessonId && !isFromCache;
  const { lesson, loading, error, refetch } = useLessonFetch(shouldFetch ? lessonId : undefined);
  
  const currentLesson = cachedLesson || lesson;
  
  const { completed, markLessonCompleted } = useLessonProgress(
    lessonId, 
    currentLesson?.course_id, 
    currentLesson?.completed
  );
  
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(
    currentLesson?.likes || 0, 
    currentLesson?.user_liked || false
  );

  // Cache quando carregar nova aula
  useEffect(() => {
    if (lesson && lessonId && !loading) {
      console.log('💾 useLessonDataOptimized: Salvando cache para:', lessonId);
      lessonCache.set(lessonId, lesson);
      setCachedLesson(lesson);
      setIsFromCache(true);
    }
  }, [lesson, lessonId, loading]);

  // Refresh que limpa cache
  const refreshLessonData = useCallback(() => {
    if (lessonId) {
      console.log('🔄 useLessonDataOptimized: Limpando cache para:', lessonId);
      lessonCache.delete(lessonId);
      setIsFromCache(false);
      setCachedLesson(null);
      
      if (refetch) {
        refetch();
      }
    }
  }, [lessonId, refetch]);

  return { 
    lesson: currentLesson, 
    loading: loading && !cachedLesson, 
    error, 
    markLessonCompleted,
    likes,
    userLiked,
    toggleLikeLesson,
    completed,
    refreshLessonData,
    isFromCache: !!cachedLesson
  };
};
