
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/components/courses/CourseLessonList';

// Cache global otimizado
const courseLessonsCache = new Map<string, {data: Lesson[], timestamp: number}>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos para lista de aulas

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
    
    const cached = courseLessonsCache.get(courseId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Loading lessons from cache for course: ${courseId}`);
      setLessons(cached.data);
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
    
    // Verificar cache novamente
    const cached = courseLessonsCache.get(courseId);
    if (!force && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Using cached lessons for course: ${courseId}`);
      setLessons(cached.data);
      setIsLoading(false);
      return;
    }
    
    const now = Date.now();
    if (!force && now - lastRefreshTime < 3000) {
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
        
        // Atualizar cache
        courseLessonsCache.set(courseId, {
          data: data || [],
          timestamp: Date.now()
        });
        
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

  return {
    lessons,
    isLoading,
    fetchLessons,
    cleanup
  };
};
