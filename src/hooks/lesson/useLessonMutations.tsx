
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { ExtendedLesson } from '@/hooks/useLessons';
import { lessonTranscriptionService } from '@/services/lesson/lessonTranscriptionService';

export const useLessonMutations = (courseId: string, onSuccess: () => Promise<void>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

      // Nota: Não precisamos mais salvar mux_upload_id em lessons
      // O vídeo é criado na tabela videos primeiro, e depois linkado via lesson_videos

      // Iniciar transcrição automaticamente se for uma aula de vídeo
      if (data.type === 'video' && data.content) {
        const videoUrl = data.content;
        // Verificar se é uma URL válida de vídeo (YouTube ou Loom)
        const isVideoUrl = videoUrl.includes('youtube.com') || 
                          videoUrl.includes('youtu.be') || 
                          videoUrl.includes('loom.com');
        
        if (isVideoUrl) {
          // Iniciar transcrição em background (não bloquear a UI)
          lessonTranscriptionService.transcribeLesson(data.id, videoUrl)
            .then(() => {
              console.log('[useLessonMutations] Transcrição iniciada para aula:', data.id);
            })
            .catch((error) => {
              console.error('[useLessonMutations] Erro ao iniciar transcrição:', error);
              // Mostrar erro apenas se for um erro crítico (não erro de rede em dev)
              const errorMessage = error?.message || 'Erro desconhecido';
              if (errorMessage.includes('servidor de desenvolvimento') || errorMessage.includes('não está rodando')) {
                // Em desenvolvimento, apenas logar (servidor pode não estar rodando)
                console.warn('[useLessonMutations] Servidor de transcrição não disponível em desenvolvimento');
              } else {
                // Em produção ou outros erros, mostrar toast
                toast({
                  title: 'Aviso sobre transcrição',
                  description: 'A aula foi criada, mas houve um problema ao iniciar a transcrição. Você pode tentar novamente mais tarde.',
                  variant: 'default',
                });
              }
            });
        }
      }

      toast({
        title: 'Aula criada',
        description: 'A aula foi criada com sucesso',
      });

      await onSuccess();
      
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
      // Buscar a aula atual antes de atualizar para comparar
      const { data: currentLesson } = await supabase
        .from('lessons')
        .select('type, content, transcription_status')
        .eq('id', lessonId)
        .single();

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

      // Iniciar transcrição se:
      // 1. A aula foi atualizada para tipo 'video', OU
      // 2. O conteúdo (URL) foi atualizado e a aula é do tipo 'video'
      const typeChangedToVideo = updateData.type === 'video';
      const contentChanged = updateData.content && updateData.content !== currentLesson?.content;
      const isVideoType = updateData.type === 'video' || (!updateData.type && currentLesson?.type === 'video');
      
      if ((typeChangedToVideo || contentChanged) && isVideoType) {
        // Buscar a aula atualizada para verificar o tipo e conteúdo
        const { data: updatedLesson } = await supabase
          .from('lessons')
          .select('type, content, transcription_status')
          .eq('id', lessonId)
          .single();

        if (updatedLesson?.type === 'video' && updatedLesson.content) {
          const videoUrl = updatedLesson.content;
          const isVideoUrl = videoUrl.includes('youtube.com') || 
                            videoUrl.includes('youtu.be') || 
                            videoUrl.includes('loom.com');
          
          // Só iniciar transcrição se:
          // 1. É uma URL válida de vídeo
          // 2. A transcrição ainda não foi concluída ou falhou (permitir retry)
          // 3. O conteúdo foi alterado (nova URL) ou ainda não tem transcrição
          const needsTranscription = !updatedLesson.transcription_status || 
                                   updatedLesson.transcription_status === 'pending' || 
                                   updatedLesson.transcription_status === 'failed';
          
          if (isVideoUrl && (contentChanged || needsTranscription)) {
            // Iniciar transcrição em background
            lessonTranscriptionService.transcribeLesson(lessonId, videoUrl)
              .then(() => {
                console.log('[useLessonMutations] Transcrição iniciada para aula atualizada:', lessonId);
              })
              .catch((error) => {
                console.error('[useLessonMutations] Erro ao iniciar transcrição:', error);
                // Mostrar erro apenas se for um erro crítico (não erro de rede em dev)
                const errorMessage = error?.message || 'Erro desconhecido';
                if (errorMessage.includes('servidor de desenvolvimento') || errorMessage.includes('não está rodando')) {
                  // Em desenvolvimento, apenas logar (servidor pode não estar rodando)
                  console.warn('[useLessonMutations] Servidor de transcrição não disponível em desenvolvimento');
                } else {
                  // Em produção ou outros erros, mostrar toast
                  toast({
                    title: 'Aviso sobre transcrição',
                    description: 'A aula foi atualizada, mas houve um problema ao iniciar a transcrição. Você pode tentar novamente mais tarde.',
                    variant: 'default',
                  });
                }
              });
          }
        }
      }

      await onSuccess();

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

  const handleReorderLessons = async (lessons: ExtendedLesson[]) => {
    setIsSubmitting(true);
    try {
      console.log("Reordering lessons:", lessons.map(l => ({ id: l.id, order_index: l.order_index })));

      // Update each lesson's order_index individually
      const updatePromises = lessons.map(lesson => 
        supabase
          .from('lessons')
          .update({ order_index: lesson.order_index })
          .eq('id', lesson.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Erro ao reordenar algumas aulas');
      }

      // Only refresh once after all updates are complete
      await onSuccess();

      toast({
        title: 'Aulas reordenadas',
        description: 'A ordem das aulas foi atualizada com sucesso',
      });

    } catch (error: any) {
      console.error("Erro ao reordenar aulas:", error);
      toast({
        title: 'Erro ao reordenar aulas',
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

      await onSuccess();
      
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
    isSubmitting,
    handleCreateLesson,
    handleUpdateLesson,
    handleReorderLessons,
    handleDeleteLesson,
  };
};
