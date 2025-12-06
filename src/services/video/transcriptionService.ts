import { supabase } from '@/integrations/supabase/client';

export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VideoTranscription {
  id: string;
  transcription_text: string | null;
  transcription_status: TranscriptionStatus;
  transcription_error: string | null;
  transcribed_at: string | null;
  transcription_metadata: Record<string, any> | null;
}

/**
 * Serviço para gerenciar transcrições de vídeos
 */
export class TranscriptionService {
  /**
   * Inicia o processo de transcrição de um vídeo
   */
  async transcribeVideo(videoId: string, videoUrl: string): Promise<void> {
    try {
      // Atualizar status para pending no banco
      await supabase
        .from('company_videos')
        .update({
          transcription_status: 'pending',
          transcription_error: null,
        })
        .eq('id', videoId);

      // Chamar API de transcrição (assíncrono)
      const response = await fetch('/api/transcribe-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          video_url: videoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao iniciar transcrição');
      }

      // A transcrição é processada assincronamente
      // O status será atualizado pelo backend
    } catch (error: any) {
      console.error('[TranscriptionService] Erro ao iniciar transcrição:', error);
      
      // Atualizar status de erro no banco
      await supabase
        .from('company_videos')
        .update({
          transcription_status: 'failed',
          transcription_error: error.message || 'Erro desconhecido',
        })
        .eq('id', videoId);

      throw error;
    }
  }

  /**
   * Verifica o status da transcrição de um vídeo
   */
  async checkTranscriptionStatus(videoId: string): Promise<VideoTranscription | null> {
    try {
      const { data, error } = await supabase
        .from('company_videos')
        .select('id, transcription_text, transcription_status, transcription_error, transcribed_at, transcription_metadata')
        .eq('id', videoId)
        .single();

      if (error) throw error;

      return data as VideoTranscription | null;
    } catch (error) {
      console.error('[TranscriptionService] Erro ao verificar status:', error);
      return null;
    }
  }

  /**
   * Obtém a transcrição completa de um vídeo
   */
  async getTranscription(videoId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('company_videos')
        .select('transcription_text, transcription_status')
        .eq('id', videoId)
        .single();

      if (error) throw error;

      if (data.transcription_status !== 'completed' || !data.transcription_text) {
        return null;
      }

      return data.transcription_text;
    } catch (error) {
      console.error('[TranscriptionService] Erro ao obter transcrição:', error);
      return null;
    }
  }

  /**
   * Gera embeddings para um vídeo transcrito
   */
  async generateEmbeddings(videoId: string): Promise<void> {
    try {
      const response = await fetch('/api/generate-embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao gerar embeddings');
      }

      const result = await response.json();
      console.log('[TranscriptionService] Embeddings gerados:', result);
    } catch (error: any) {
      console.error('[TranscriptionService] Erro ao gerar embeddings:', error);
      throw error;
    }
  }

  /**
   * Inicia transcrição e gera embeddings automaticamente quando concluída
   * Usa polling para verificar quando a transcrição está completa
   */
  async transcribeVideoWithEmbeddings(
    videoId: string,
    videoUrl: string,
    onStatusUpdate?: (status: TranscriptionStatus) => void
  ): Promise<void> {
    // Iniciar transcrição
    await this.transcribeVideo(videoId, videoUrl);
    
    if (onStatusUpdate) {
      onStatusUpdate('processing');
    }

    // Polling para verificar quando a transcrição está completa
    const maxAttempts = 60; // 5 minutos (5s * 60)
    const pollInterval = 5000; // 5 segundos

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const status = await this.checkTranscriptionStatus(videoId);

      if (!status) {
        continue;
      }

      if (status.transcription_status === 'completed') {
        // Gerar embeddings automaticamente
        try {
          await this.generateEmbeddings(videoId);
          if (onStatusUpdate) {
            onStatusUpdate('completed');
          }
          return;
        } catch (error) {
          console.error('[TranscriptionService] Erro ao gerar embeddings após transcrição:', error);
          // Não falhar completamente, apenas logar o erro
        }
        return;
      }

      if (status.transcription_status === 'failed') {
        if (onStatusUpdate) {
          onStatusUpdate('failed');
        }
        throw new Error(status.transcription_error || 'Transcrição falhou');
      }

      // Se ainda está processando, continuar polling
      if (onStatusUpdate && status.transcription_status === 'processing') {
        onStatusUpdate('processing');
      }
    }

    // Timeout
    throw new Error('Timeout ao aguardar transcrição');
  }
}

// Instância singleton
export const transcriptionService = new TranscriptionService();

