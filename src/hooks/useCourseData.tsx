
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCourseData = (courseId: string | undefined) => {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (courseError) throw courseError;
      
      // Fetch lessons for the course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      
      // Get user's progress
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: progressData } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .single();
        
        setCourse({
          ...courseData,
          lessons: lessonsData || [],
          progress: progressData?.progress || 0,
          favorite: progressData?.favorite || false,
        });
      } else {
        setCourse({
          ...courseData,
          lessons: lessonsData || [],
          progress: 0,
        });
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching course data:', err);
      setError(err);
      // Only show toast for network errors, not for "no rows returned" which is handled by UI
      if (!err.message.includes('no rows returned')) {
        toast.error('Erro ao carregar curso', {
          description: 'Ocorreu um erro ao carregar os dados do curso.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Initial data fetch
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Add a function to refresh the course data
  const refreshCourseData = useCallback(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  return { course, loading, error, refreshCourseData };
};
