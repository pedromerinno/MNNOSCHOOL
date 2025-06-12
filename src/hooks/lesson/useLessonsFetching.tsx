
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/components/courses/CourseLessonList';

export const useLessonsFetching = (courseId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const { toast } = useToast();

  const fetchLessons = useCallback(async (force = false) => {
    if (!courseId) return;
    
    const now = Date.now();
    // Increase debounce time to 2 seconds to prevent multiple rapid refreshes
    if (!force && now - lastRefreshTime < 2000) {
      console.log(`Skipping lessons refresh for ${courseId} - too soon since last refresh`);
      return;
    }
    
    setIsLoading(true);
    setLastRefreshTime(now);
    
    try {
      console.log(`Fetching lessons for course: ${courseId}`);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      console.log("Aulas carregadas com sucesso:", data?.length || 0);
      setLessons(data || []);
    } catch (error: any) {
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

  return {
    lessons,
    isLoading,
    fetchLessons
  };
};
