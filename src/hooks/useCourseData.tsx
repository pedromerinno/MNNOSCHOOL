
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lesson } from '@/components/courses/CourseLessonList';

type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  instructor: string | null;
  lessons: Lesson[];
  progress: number;
  completed: boolean;
  favorite: boolean;
  tags?: string[];
};

export const useCourseData = (courseId: string | undefined) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch the course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select(`
            id, 
            title, 
            description, 
            image_url, 
            instructor,
            tags
          `)
          .eq('id', courseId)
          .single();
        
        if (courseError) {
          throw courseError;
        }
        
        // Fetch the lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select(`
            id, 
            title, 
            description, 
            duration, 
            type, 
            order_index
          `)
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
        
        if (lessonsError) {
          throw lessonsError;
        }
        
        // Fetch user progress for lessons
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data: lessonProgressData, error: lessonProgressError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', userId || '');
        
        if (lessonProgressError) {
          console.error('Error fetching lesson progress:', lessonProgressError);
        }
        
        // Fetch user progress for this course
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('progress, completed, favorite')
          .eq('course_id', courseId)
          .eq('user_id', userId || '')
          .maybeSingle();
        
        if (progressError) {
          console.error('Error fetching progress:', progressError);
        }
        
        // Format the lessons
        const formattedLessons: Lesson[] = lessonsData.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          type: lesson.type,
          order_index: lesson.order_index,
          course_id: courseId, // Add the course_id here
          completed: lessonProgressData?.some(progress => 
            progress.lesson_id === lesson.id && progress.completed
          ) || false
        }));
        
        // Calculate progress if not available
        let progress = 0;
        let completed = false;
        let favorite = false;
        
        if (progressData) {
          progress = progressData.progress;
          completed = progressData.completed;
          favorite = progressData.favorite || false;
        } else {
          // Calculate progress based on completed lessons
          const completedLessons = formattedLessons.filter(lesson => lesson.completed).length;
          if (formattedLessons.length > 0) {
            progress = Math.round((completedLessons / formattedLessons.length) * 100);
          }
          completed = progress === 100;
        }
        
        setCourse({
          ...courseData,
          lessons: formattedLessons,
          progress,
          completed,
          favorite
        });
        
      } catch (error: any) {
        console.error('Error fetching course:', error);
        setError(error);
        toast({
          title: 'Erro ao carregar curso',
          description: error.message || 'Ocorreu um erro ao buscar os dados do curso',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId, toast]);

  return { course, loading, error };
};
