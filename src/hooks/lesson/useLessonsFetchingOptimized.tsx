
import { useState, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/components/courses/CourseLessonList';

// Cache global para aulas por curso
const courseLessonsCache = new Map<string, {data: Lesson[], timestamp: number}>();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutos

export const useLessonsFetchingOptimized = (courseId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const fetchLessons = useCallback(async (force = false) => {
    if (!courseId) return;
    
    // Verificar cache primeiro
    const cached = courseLessonsCache.get(courseId);
    if (!force && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Using cached lessons for course: ${courseId}`);
      setLessons(cached.data);
      setIsLoading(false);
      return;
    }
    
    const now = Date.now();
    if (!force && now - lastRefreshTime < 1000) {
      console.log(`Skipping lessons refresh for ${courseId} - too soon since last refresh`);
      return;
    }
    
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Criar novo AbortController
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setLastRefreshTime(now);
    
    try {
      console.log(`Fetching lessons for course: ${courseId}`);
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        .abortSignal(abortControllerRef.current.signal);

      if (error) {
        throw error;
      }

      console.log("Aulas carregadas com sucesso:", data?.length || 0);
      
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
      
      console.error("Erro ao carregar aulas:", error);
      toast({
        title: 'Erro ao carregar aulas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [courseId, toast, lastRefreshTime]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    lessons,
    isLoading,
    fetchLessons,
    cleanup
  };
};
