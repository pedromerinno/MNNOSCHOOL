
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lesson } from '@/components/courses/CourseLessonList';

export const useLessonFetch = (lessonId: string | undefined) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Buscar os dados da aula incluindo a descrição do curso
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select(`
            *,
            courses (
              description
            )
          `)
          .eq('id', lessonId)
          .single();
        
        if (lessonError) {
          throw lessonError;
        }
        
        // Buscar o progresso da aula para este usuário
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('completed')
          .eq('lesson_id', lessonId)
          .eq('user_id', userId || '')
          .maybeSingle();
        
        if (progressError) {
          console.error('Erro ao buscar progresso da aula:', progressError);
        }
        
        const lessonWithCourseDescription = {
          ...lessonData,
          course_description: lessonData.courses?.description || null,
          completed: progressData?.completed || false
        } as Lesson;
        
        setLesson(lessonWithCourseDescription);
        
        // Update last access
        if (userId) {
          const { error: updateError } = await supabase
            .from('user_lesson_progress')
            .upsert({
              user_id: userId,
              lesson_id: lessonId,
              completed: progressData?.completed || false,
              last_accessed: new Date().toISOString()
            }, { 
              onConflict: 'user_id,lesson_id'
            });
          
          if (updateError) {
            console.error('Erro ao atualizar último acesso:', updateError);
          }
        }
        
      } catch (error: any) {
        console.error('Erro ao buscar aula:', error);
        setError(error);
        toast({
          title: 'Erro ao carregar aula',
          description: error.message || 'Ocorreu um erro ao buscar os dados da aula',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLesson();
  }, [lessonId, toast]);

  return { lesson, setLesson, loading, error };
};
