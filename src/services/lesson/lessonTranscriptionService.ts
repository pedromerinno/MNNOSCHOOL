import { supabase } from '@/integrations/supabase/client';
import { TranscriptionStatus } from '@/services/video/transcriptionService';

export interface LessonTranscription {
  id: string;
  transcription_text: string | null;
  transcription_status: TranscriptionStatus;
  transcription_error: string | null;
  transcribed_at: string | null;
  transcription_metadata: Record<string, any> | null;
}

/**
 * Serviço para gerenciar transcrições de aulas (lessons)
 */
export class LessonTranscriptionService {
  /**
   * Inicia o processo de transcrição de uma aula com vídeo
   */
  async transcribeLesson(lessonId: string, videoUrl: string): Promise<void> {
    try {
      // Atualizar status para pending no banco
      await supabase
        .from('lessons')
        .update({
          transcription_status: 'pending',
          transcription_error: null,
        })
        .eq('id', lessonId);

      // Chamar API de transcrição (assíncrono)
      console.log('[LessonTranscriptionService] Iniciando transcrição:', { lessonId, videoUrl });
      
      let response: Response;
      try {
        response = await fetch('/api/transcribe-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_id: lessonId,
            video_url: videoUrl,
            table_type: 'lessons',
          }),
        });
      } catch (fetchError: any) {
        // Erro de rede (fetch failed, DNS, etc)
        console.error('[LessonTranscriptionService] Erro de rede ao chamar API:', fetchError);
        throw new Error(
          `Erro de conexão ao iniciar transcrição. Verifique se o servidor de desenvolvimento está rodando e se a API route está configurada corretamente. Erro: ${fetchError.message || 'fetch failed'}`
        );
      }

      console.log('[LessonTranscriptionService] Resposta da API:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao iniciar transcrição';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('[LessonTranscriptionService] Erro da API:', errorData);
        } catch (e) {
          const errorText = await response.text().catch(() => '');
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          console.error('[LessonTranscriptionService] Erro ao parsear resposta:', errorText);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json().catch(() => ({}));
      console.log('[LessonTranscriptionService] Transcrição iniciada com sucesso:', result);

      // A transcrição é processada assincronamente
      // O status será atualizado pelo backend
    } catch (error: any) {
      console.error('[LessonTranscriptionService] Erro ao iniciar transcrição:', error);
      
      // Atualizar status de erro no banco
      await supabase
        .from('lessons')
        .update({
          transcription_status: 'failed',
          transcription_error: error.message || 'Erro desconhecido',
        })
        .eq('id', lessonId);

      throw error;
    }
  }

  /**
   * Verifica o status da transcrição de uma aula
   */
  async checkTranscriptionStatus(lessonId: string): Promise<LessonTranscription | null> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, transcription_text, transcription_status, transcription_error, transcribed_at, transcription_metadata')
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      return data as LessonTranscription | null;
    } catch (error) {
      console.error('[LessonTranscriptionService] Erro ao verificar status:', error);
      return null;
    }
  }

  /**
   * Obtém a transcrição completa de uma aula
   */
  async getTranscription(lessonId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('transcription_text, transcription_status')
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      if (data.transcription_status !== 'completed' || !data.transcription_text) {
        return null;
      }

      return data.transcription_text;
    } catch (error) {
      console.error('[LessonTranscriptionService] Erro ao obter transcrição:', error);
      return null;
    }
  }
}

// Instância singleton
export const lessonTranscriptionService = new LessonTranscriptionService();
