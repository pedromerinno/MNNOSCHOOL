
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  duration: string | null;
  type: string;
  order_index: number;
  course_id: string;
  completed: boolean;
};

type LessonNavigation = {
  id: string;
  title: string;
  type: string;
};

export const useLessonData = (lessonId: string | undefined) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [previousLesson, setPreviousLesson] = useState<LessonNavigation | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonNavigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Buscar os dados da aula
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
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
        
        setLesson({
          ...lessonData,
          completed: progressData?.completed || false
        });
        
        // Buscar aulas anterior e próxima
        if (lessonData) {
          await fetchNavigationLessons(lessonData.course_id, lessonData.order_index);
        }
        
        // Buscar likes da aula
        await fetchLessonLikes(lessonId, userId);
        
        // Atualizar o último acesso a esta aula
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

  const fetchLessonLikes = async (lessonId: string, userId: string | undefined) => {
    try {
      // Buscar o total de likes
      const { count, error } = await supabase
        .from('lesson_likes')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);
      
      if (error) throw error;
      
      setLikes(count || 0);
      
      // Verificar se o usuário atual já curtiu
      if (userId) {
        const { data, error: likeError } = await supabase
          .from('lesson_likes')
          .select('*')
          .eq('lesson_id', lessonId)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (likeError) throw likeError;
        
        setUserLiked(!!data);
      }
    } catch (error) {
      console.error('Erro ao buscar likes:', error);
    }
  };

  const fetchNavigationLessons = async (courseId: string, currentOrderIndex: number) => {
    try {
      // Buscar aula anterior
      const { data: prevData, error: prevError } = await supabase
        .from('lessons')
        .select('id, title, type')
        .eq('course_id', courseId)
        .lt('order_index', currentOrderIndex)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (prevError) throw prevError;
      
      setPreviousLesson(prevData || null);
      
      // Buscar próxima aula
      const { data: nextData, error: nextError } = await supabase
        .from('lessons')
        .select('id, title, type')
        .eq('course_id', courseId)
        .gt('order_index', currentOrderIndex)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (nextError) throw nextError;
      
      setNextLesson(nextData || null);
    } catch (error) {
      console.error('Erro ao buscar aulas para navegação:', error);
    }
  };

  const toggleLikeLesson = async () => {
    if (!lesson) return;
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      if (userLiked) {
        // Remover like
        const { error } = await supabase
          .from('lesson_likes')
          .delete()
          .eq('lesson_id', lesson.id)
          .eq('user_id', userId);
        
        if (error) throw error;
        
        setLikes(prev => Math.max(0, prev - 1));
        setUserLiked(false);
        
        toast({
          title: 'Like removido',
          description: 'Você removeu seu like desta aula',
        });
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('lesson_likes')
          .insert({
            lesson_id: lesson.id,
            user_id: userId,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        setLikes(prev => prev + 1);
        setUserLiked(true);
        
        toast({
          title: 'Aula curtida!',
          description: 'Obrigado pelo seu feedback',
        });
      }
    } catch (error: any) {
      console.error('Erro ao curtir/descurtir aula:', error);
      toast({
        title: 'Erro ao processar sua ação',
        description: error.message || 'Ocorreu um erro ao curtir/descurtir a aula',
        variant: 'destructive',
      });
    }
  };

  const markLessonCompleted = async () => {
    if (!lesson) return;
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      // Marcar a aula como concluída
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lesson.id,
          completed: true,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });
      
      if (error) throw error;
      
      // Atualizar o estado local
      setLesson(prev => prev ? { ...prev, completed: true } : null);
      
      // Atualizar o progresso do curso
      await updateCourseProgress(lesson.course_id, userId);
      
      toast({
        title: 'Aula concluída',
        description: 'Seu progresso foi salvo com sucesso',
      });
      
      // Se houver próxima aula, perguntar se quer continuar
      if (nextLesson) {
        toast({
          title: 'Continuar para a próxima aula?',
          description: 'Clique no botão "Próxima aula" para continuar seu aprendizado',
        });
      }
      
    } catch (error: any) {
      console.error('Erro ao marcar aula como concluída:', error);
      toast({
        title: 'Erro ao salvar progresso',
        description: error.message || 'Ocorreu um erro ao marcar a aula como concluída',
        variant: 'destructive',
      });
    }
  };
  
  const updateCourseProgress = async (courseId: string, userId: string) => {
    try {
      // Buscar todas as aulas do curso
      const { data: courseLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);
      
      if (lessonsError) throw lessonsError;
      
      // Buscar todas as aulas concluídas deste curso
      const { data: completedLessons, error: completedError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true);
      
      if (completedError) throw completedError;
      
      // Calcular o progresso
      const totalLessons = courseLessons.length;
      const completedCount = completedLessons.filter(progress => 
        courseLessons.some(lesson => lesson.id === progress.lesson_id)
      ).length;
      
      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      const completed = progress === 100;
      
      // Atualizar o progresso do curso
      const { error: updateError } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          progress,
          completed,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        });
      
      if (updateError) throw updateError;
      
    } catch (error) {
      console.error('Erro ao atualizar progresso do curso:', error);
    }
  };

  const navigateToLesson = (lessonId: string) => {
    if (!lesson) return;
    navigate(`/courses/${lesson.course_id}/lessons/${lessonId}`);
  };

  return { 
    lesson, 
    loading, 
    error, 
    markLessonCompleted,
    previousLesson,
    nextLesson,
    navigateToLesson,
    likes,
    userLiked,
    toggleLikeLesson
  };
};
