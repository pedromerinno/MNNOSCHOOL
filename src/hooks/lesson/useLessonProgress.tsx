
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLessonProgress = (
  lessonId: string | undefined, 
  courseId: string | undefined, 
  initialCompleted: boolean = false
) => {
  const [completed, setCompleted] = useState<boolean>(initialCompleted);
  const { toast } = useToast();

  const markLessonCompleted = useCallback(async () => {
    if (!lessonId || !courseId) return;
    
    try {
      // Get current user ID
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Toggle completed status
      const newStatus = !completed;
      setCompleted(newStatus);
      
      // Update lesson progress in database
      const { error: lessonError } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: newStatus,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });
      
      if (lessonError) {
        throw lessonError;
      }
      
      // If marked as completed, get all lessons for this course and calculate progress
      if (newStatus) {
        // Get all lessons for this course
        const { data: courseLessons, error: courseLessonsError } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', courseId);
        
        if (courseLessonsError) {
          throw courseLessonsError;
        }
        
        // Get completed lessons
        const { data: completedLessons, error: completedLessonsError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('completed', true);
        
        if (completedLessonsError) {
          throw completedLessonsError;
        }
        
        // Calculate progress percentage
        const totalLessons = courseLessons.length;
        const completedCount = completedLessons
          .filter(progress => 
            courseLessons.some(lesson => lesson.id === progress.lesson_id)
          ).length;
        
        const progressPercentage = Math.round((completedCount / totalLessons) * 100);
        
        // Update course progress
        const { error: courseProgressError } = await supabase
          .from('user_course_progress')
          .upsert({
            user_id: userId,
            course_id: courseId,
            progress: progressPercentage,
            completed: progressPercentage === 100,
            last_accessed: new Date().toISOString()
          }, {
            onConflict: 'user_id,course_id'
          });
        
        if (courseProgressError) {
          throw courseProgressError;
        }
      }
      
      // Show success message
      toast({
        title: newStatus ? 'Aula concluída' : 'Aula marcada como não concluída',
        description: newStatus 
          ? 'Seu progresso foi atualizado com sucesso' 
          : 'A aula foi marcada como não concluída',
      });
      
    } catch (error: any) {
      console.error('Erro ao atualizar progresso:', error);
      // Revert state change on error
      setCompleted(!completed);
      
      toast({
        title: 'Erro ao atualizar progresso',
        description: error.message || 'Não foi possível atualizar seu progresso',
        variant: 'destructive',
      });
    }
  }, [completed, courseId, lessonId, toast]);

  return { completed, markLessonCompleted };
};
