
import { useCallback, useEffect, useState } from 'react';
import { useLessonFetch } from './useLessonFetch';
import { useLessonProgress } from './useLessonProgress';
import { useLessonLikes } from './useLessonLikes';

// Cache simples sem Map complexo
const lessonCache: Record<string, any> = {};

export const useLessonDataOptimized = (lessonId: string | undefined) => {
  const [cachedLesson, setCachedLesson] = useState<any>(null);
  
  console.log('🔧 useLessonDataOptimized: Hook chamado com lessonId:', lessonId);
  
  // Sempre fazer fetch - sem cache complexo
  const { lesson, loading, error, refetch, setLesson } = useLessonFetch(lessonId);
  
  // Use lesson diretamente ou cache se disponível
  const currentLesson = lesson || cachedLesson || lessonCache[lessonId || ''];
  
  const { completed, markLessonCompleted } = useLessonProgress(
    lessonId, 
    currentLesson?.course_id, 
    currentLesson?.completed
  );
  
  const { likes, userLiked, toggleLikeLesson } = useLessonLikes(
    currentLesson?.likes || 0, 
    currentLesson?.user_liked || false
  );

  // Cache simples quando lesson carrega
  useEffect(() => {
    if (lesson && lessonId) {
      console.log('💾 Cache simples para:', lessonId);
      lessonCache[lessonId] = lesson;
      setCachedLesson(lesson);
    }
  }, [lesson, lessonId]);

  // Limpar cache antigo quando muda lessonId
  useEffect(() => {
    if (lessonId && cachedLesson && cachedLesson.id !== lessonId) {
      setCachedLesson(null);
    }
  }, [lessonId, cachedLesson]);

  // Escutar atualizações de campos da aula
  useEffect(() => {
    const handleLessonFieldUpdate = (event: CustomEvent) => {
      const { lessonId: updatedLessonId, field, value } = event.detail;
      
      if (updatedLessonId === lessonId || updatedLessonId === 'current') {
        console.log('📝 Atualizando campo da aula:', field, value);
        
        // Atualizar lesson atual
        if (currentLesson) {
          const updatedLesson = { ...currentLesson, [field]: value };
          
          // Atualizar cache
          if (lessonId) {
            lessonCache[lessonId] = updatedLesson;
          }
          setCachedLesson(updatedLesson);
          
          // Atualizar estado do hook de fetch
          if (setLesson) {
            setLesson(updatedLesson);
          }
        }
      }
    };

    window.addEventListener('lesson-field-updated', handleLessonFieldUpdate as EventListener);
    
    return () => {
      window.removeEventListener('lesson-field-updated', handleLessonFieldUpdate as EventListener);
    };
  }, [lessonId, currentLesson, setLesson]);

  const refreshLessonData = useCallback(() => {
    if (lessonId) {
      console.log('🔄 Refresh data para:', lessonId);
      delete lessonCache[lessonId];
      setCachedLesson(null);
      if (refetch) {
        refetch();
      }
    }
  }, [lessonId, refetch]);

  // Não mostrar loading se já temos dados em cache
  const shouldShowLoading = loading && !currentLesson;

  return { 
    lesson: currentLesson, 
    loading: shouldShowLoading, 
    error, 
    markLessonCompleted,
    likes,
    userLiked,
    toggleLikeLesson,
    completed,
    refreshLessonData,
    isFromCache: !!cachedLesson && !lesson
  };
};
