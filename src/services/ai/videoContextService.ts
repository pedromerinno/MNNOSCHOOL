import { supabase } from '@/integrations/supabase/client';

export interface RelevantVideoChunk {
  video_id: string;
  video_title: string;
  chunk_text: string;
  chunk_index: number;
  similarity_score?: number;
}

export interface RelevantVideo {
  video_id: string;
  video_title: string;
  video_description: string | null;
  chunks: RelevantVideoChunk[];
  max_similarity: number;
}

/**
 * Serviço para buscar vídeos relevantes usando busca semântica (RAG)
 */
export class VideoContextService {
  /**
   * Gera embedding para uma query usando OpenAI
   */
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      const response = await fetch('/api/generate-query-embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar embedding da query');
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('[VideoContextService] Erro ao gerar embedding:', error);
      throw error;
    }
  }

  /**
   * Busca vídeos relevantes usando busca semântica com embeddings
   */
  async searchRelevantVideos(
    companyId: string,
    query: string,
    limit: number = 5
  ): Promise<RelevantVideo[]> {
    try {
      // Primeiro, gerar embedding da query
      const queryEmbedding = await this.generateQueryEmbedding(query);

      // Converter array para string no formato do PostgreSQL
      const embeddingString = `[${queryEmbedding.join(',')}]`;

      // Buscar chunks relevantes usando busca vetorial
      // Usando cosine similarity (1 - cosine_distance)
      const { data: chunks, error } = await supabase.rpc('search_video_embeddings', {
        query_embedding: embeddingString,
        company_id_param: companyId,
        match_threshold: 0.7, // Threshold de similaridade (0-1)
        match_count: limit * 3, // Buscar mais chunks para agrupar por vídeo
      });

      if (error) {
        // Se a função RPC não existir, fazer busca alternativa
        console.warn('[VideoContextService] Função RPC não encontrada, usando busca alternativa');
        return await this.searchRelevantVideosAlternative(companyId, query, limit);
      }

      if (!chunks || chunks.length === 0) {
        return [];
      }

      // Agrupar chunks por vídeo e calcular similaridade máxima
      const videosMap = new Map<string, RelevantVideo>();

      for (const chunk of chunks) {
        const videoId = chunk.video_id;
        
        if (!videosMap.has(videoId)) {
          // Buscar informações do vídeo
          const { data: video } = await supabase
            .from('company_videos')
            .select('id, title, description')
            .eq('id', videoId)
            .single();

          if (video) {
            videosMap.set(videoId, {
              video_id: videoId,
              video_title: video.title,
              video_description: video.description,
              chunks: [],
              max_similarity: chunk.similarity || 0,
            });
          }
        }

        const video = videosMap.get(videoId);
        if (video) {
          video.chunks.push({
            video_id: videoId,
            video_title: video.video_title,
            chunk_text: chunk.chunk_text,
            chunk_index: chunk.chunk_index,
            similarity_score: chunk.similarity,
          });

          // Atualizar similaridade máxima
          if (chunk.similarity && chunk.similarity > video.max_similarity) {
            video.max_similarity = chunk.similarity;
          }
        }
      }

      // Converter para array, ordenar por similaridade e limitar
      const videos = Array.from(videosMap.values())
        .sort((a, b) => b.max_similarity - a.max_similarity)
        .slice(0, limit);

      return videos;
    } catch (error) {
      console.error('[VideoContextService] Erro ao buscar vídeos relevantes:', error);
      // Fallback para busca por palavras-chave
      return await this.searchRelevantVideosAlternative(companyId, query, limit);
    }
  }

  /**
   * Busca alternativa usando palavras-chave quando embeddings não estão disponíveis
   */
  private async searchRelevantVideosAlternative(
    companyId: string,
    query: string,
    limit: number = 5
  ): Promise<RelevantVideo[]> {
    try {
      // Buscar vídeos com transcrições que contenham palavras da query
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      
      if (queryWords.length === 0) {
        return [];
      }

      // Construir query de busca
      const searchPattern = `%${queryWords.join('%')}%`;

      const { data: videos, error } = await supabase
        .from('company_videos')
        .select('id, title, description, transcription_text')
        .eq('company_id', companyId)
        .eq('transcription_status', 'completed')
        .not('transcription_text', 'is', null)
        .ilike('transcription_text', searchPattern)
        .limit(limit * 2); // Buscar mais para ter opções

      if (error) throw error;

      if (!videos || videos.length === 0) {
        return [];
      }

      // Criar chunks relevantes baseados em trechos que contêm as palavras
      const relevantVideos: RelevantVideo[] = [];

      for (const video of videos) {
        if (!video.transcription_text) continue;

        // Encontrar trechos relevantes (sentenças que contêm palavras da query)
        const sentences = video.transcription_text.split(/[.!?]\s+/);
        const relevantChunks: RelevantVideoChunk[] = [];

        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i].toLowerCase();
          const matches = queryWords.filter(word => sentence.includes(word)).length;
          
          if (matches > 0) {
            relevantChunks.push({
              video_id: video.id,
              video_title: video.title,
              chunk_text: sentences[i],
              chunk_index: i,
            });
          }
        }

        if (relevantChunks.length > 0) {
          relevantVideos.push({
            video_id: video.id,
            video_title: video.title,
            video_description: video.description,
            chunks: relevantChunks.slice(0, 3), // Limitar a 3 chunks por vídeo
            max_similarity: 0.8, // Similaridade estimada para busca por palavras
          });
        }
      }

      return relevantVideos.slice(0, limit);
    } catch (error) {
      console.error('[VideoContextService] Erro na busca alternativa:', error);
      return [];
    }
  }

  /**
   * Formata vídeos relevantes para incluir no contexto do prompt da IA
   */
  formatVideosForContext(videos: RelevantVideo[]): string {
    if (videos.length === 0) {
      return '';
    }

    let context = '## CONHECIMENTO DOS VÍDEOS DA EMPRESA\n\n';
    context += 'Baseado na pergunta do usuário, aqui estão transcrições relevantes de vídeos da empresa:\n\n';

    for (const video of videos) {
      context += `### [Vídeo: ${video.video_title}]\n\n`;
      
      if (video.video_description) {
        context += `Descrição: ${video.video_description}\n\n`;
      }

      context += 'Transcrição relevante:\n';
      
      for (const chunk of video.chunks) {
        context += `- ${chunk.chunk_text}\n`;
      }

      context += '\n';
    }

    context += 'Use essas informações para responder de forma precisa e contextualizada. ';
    context += 'Quando apropriado, mencione qual vídeo contém a informação relevante.\n\n';

    return context;
  }
}

// Instância singleton
export const videoContextService = new VideoContextService();


