
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/components/courses/CourseLessonList';

// Cache global otimizado com localStorage
const courseLessonsCache = new Map<string, {data: Lesson[], timestamp: number}>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos para lista de aulas
const STORAGE_KEY = 'course-lessons-cache';

// Funções de cache com localStorage
const getCachedLessons = (courseId: string) => {
  // Verificar cache em memória primeiro
  const memoryCache = courseLessonsCache.get(courseId);
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    return memoryCache.data;
  }

  // Verificar localStorage
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${courseId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        // Repovoar cache em memória
        courseLessonsCache.set(courseId, parsed);
        return parsed.data;
      }
    }
  } catch (error) {
    console.warn('Error reading lessons from localStorage:', error);
  }
  
  return null;
};

const setCachedLessons = (courseId: string, lessons: Lesson[]) => {
  const cacheEntry = {
    data: lessons,
    timestamp: Date.now()
  };
  
  // Salvar em memória
  courseLessonsCache.set(courseId, cacheEntry);
  
  // Salvar em localStorage
  try {
    localStorage.setItem(`${STORAGE_KEY}-${courseId}`, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('Error writing lessons to localStorage:', error);
  }
};

export const useLessonsFetchingOptimized = (courseId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const { toast } = useToast();

  // Carregar do cache imediatamente
  useEffect(() => {
    if (!courseId) return;
    
    const cached = getCachedLessons(courseId);
    if (cached) {
      console.log(`Loading lessons from cache for course: ${courseId}`);
      setLessons(cached);
      setIsLoading(false);
      return;
    }
    
    // Se não tem cache, buscar
    fetchLessons();
  }, [courseId]);

  const fetchLessons = useCallback(async (force = false) => {
    if (!courseId) return;
    
    // Evitar múltiplas requisições simultâneas
    if (fetchPromiseRef.current && !force) {
      console.log('Fetch already in progress, waiting...');
      return fetchPromiseRef.current;
    }
    
    // Verificar cache novamente se não for forçado
    if (!force) {
      const cached = getCachedLessons(courseId);
      if (cached) {
        console.log(`Using cached lessons for course: ${courseId}`);
        setLessons(cached);
        setIsLoading(false);
        return;
      }
    }
    
    const now = Date.now();
    if (!force && now - lastRefreshTime < 2000) {
      console.log(`Skipping lessons refresh for ${courseId} - too recent`);
      return;
    }
    
    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setLastRefreshTime(now);
    
    const fetchPromise = async () => {
      try {
        console.log(`Fetching lessons for course: ${courseId}`);
        
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true })
          .abortSignal(abortControllerRef.current!.signal);

        if (error) throw error;

        console.log("Lessons loaded successfully:", data?.length || 0);
        
        // Atualizar cache com localStorage
        setCachedLessons(courseId, data || []);
        setLessons(data || []);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch lessons request was aborted');
          return;
        }
        
        console.error("Error loading lessons:", error);
        toast({
          title: 'Erro ao carregar aulas',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        fetchPromiseRef.current = null;
      }
    };
    
    fetchPromiseRef.current = fetchPromise();
    return fetchPromiseRef.current;
  }, [courseId, toast, lastRefreshTime]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    fetchPromiseRef.current = null;
  }, []);

  // Função para limpar cache
  const clearCache = useCallback(() => {
    courseLessonsCache.delete(courseId);
    try {
      localStorage.removeItem(`${STORAGE_KEY}-${courseId}`);
    } catch (error) {
      console.warn('Error clearing lessons cache:', error);
    }
  }, [courseId]);

  return {
    lessons,
    isLoading,
    fetchLessons,
    cleanup,
    clearCache
  };
};
