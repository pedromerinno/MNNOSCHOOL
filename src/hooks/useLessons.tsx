import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/components/courses/CourseLessonList';

export interface ExtendedLesson extends Omit<Lesson, 'content'> {
  content?: string;
}

export const useLessons = (courseId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<ExtendedLesson | undefined>(undefined);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const { toast } = useToast();

  // Memoized fetch function to prevent recreating on each render
  const fetchLessons = useCallback(async (force = false) => {
    if (!courseId) return;
    
    // Prevent multiple rapid refreshes (within 1 second)
    const now = Date.now();
    if (!force && now - lastRefreshTime < 1000) {
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

  useEffect(() => {
    if (!courseId) return;

    // Create a unique channel ID for this hook instance
    const hookInstanceId = Math.random().toString(36).substring(2, 9);
    const channelId = `lessons-hook-${courseId}-${hookInstanceId}`;
    console.log(`Creating channel: ${channelId}`);
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          console.log(`Received real-time update in lessons hook (${channelId}):`, payload);
          
          // Instead of handling the updates here, just trigger a refresh
          // This prevents race conditions with multiple subscriptions
          fetchLessons(true);
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${channelId}: ${status}`);
      });

    // Initial fetch of lessons
    fetchLessons();

    // Cleanup subscription on unmount
    return () => {
      console.log(`Cleaning up real-time subscription for lessons hook: ${channelId}`);
      supabase.removeChannel(channel);
    };
  }, [courseId, fetchLessons]);

  const handleCreateLesson = async (lessonData: Omit<ExtendedLesson, 'id' | 'completed'>) => {
    if (!courseId) return;
    
    setIsSubmitting(true);
    try {
      const lessonDataWithDefaults = {
        ...lessonData,
        course_id: courseId,
        order_index: lessonData.order_index ?? 0,
      };

      console.log("Creating new lesson:", lessonDataWithDefaults);

      const { data, error } = await supabase
        .from('lessons')
        .insert([lessonDataWithDefaults])
        .select()
        .single();

      if (error) throw error;

      console.log("Lesson created successfully:", data);

      toast({
        title: 'Aula criada',
        description: 'A aula foi criada com sucesso',
      });

      // Force refresh lessons list
      await fetchLessons();
      
      return data;
    } catch (error: any) {
      console.error("Erro ao criar aula:", error);
      toast({
        title: 'Erro ao criar aula',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLesson = async (lessonId: string, lessonData: Partial<ExtendedLesson>) => {
    setIsSubmitting(true);
    try {
      const updateData: any = {};
      if (lessonData.title !== undefined) updateData.title = lessonData.title;
      if (lessonData.description !== undefined) updateData.description = lessonData.description;
      if (lessonData.content !== undefined) updateData.content = lessonData.content;
      if (lessonData.duration !== undefined) updateData.duration = lessonData.duration;
      if (lessonData.type !== undefined) updateData.type = lessonData.type;
      if (lessonData.order_index !== undefined) updateData.order_index = lessonData.order_index;

      console.log(`Updating lesson ${lessonId}:`, updateData);

      const { error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', lessonId);

      if (error) throw error;

      // Force refresh lessons list
      await fetchLessons();

      toast({
        title: 'Aula atualizada',
        description: 'A aula foi atualizada com sucesso',
      });

    } catch (error: any) {
      console.error("Erro ao atualizar aula:", error);
      toast({
        title: 'Erro ao atualizar aula',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      console.log(`Deleting lesson ${lessonId}`);
      
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      // Force refresh lessons list
      await fetchLessons();
      
      toast({
        title: 'Aula excluída',
        description: 'A aula foi excluída com sucesso',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir aula',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    lessons,
    isLoading,
    selectedLesson,
    setSelectedLesson,
    isSubmitting,
    fetchLessons,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
  };
};
