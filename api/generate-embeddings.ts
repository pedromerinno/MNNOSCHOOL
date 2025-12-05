import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface GenerateEmbeddingsRequest {
  video_id: string;
}

/**
 * Divide o texto em chunks de aproximadamente 500 tokens
 * Usa uma abordagem simples baseada em caracteres (1 token ≈ 4 caracteres)
 */
function chunkText(text: string, chunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Dividir por sentenças primeiro
  const sentences = text.split(/[.!?]\s+/);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // Se algum chunk ainda for muito grande, dividir por parágrafos
  return chunks.map(chunk => {
    if (chunk.length > chunkSize * 1.5) {
      const paragraphs = chunk.split(/\n\n+/);
      const subChunks: string[] = [];
      let subChunk = '';
      
      for (const para of paragraphs) {
        if ((subChunk + para).length > chunkSize && subChunk) {
          subChunks.push(subChunk.trim());
          subChunk = para;
        } else {
          subChunk += (subChunk ? '\n\n' : '') + para;
        }
      }
      
      if (subChunk.trim()) {
        subChunks.push(subChunk.trim());
      }
      
      return subChunks;
    }
    return [chunk];
  }).flat();
}

/**
 * Gera embedding para um texto usando OpenAI Embeddings API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small', // Modelo mais barato e eficiente
      input: text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { video_id }: GenerateEmbeddingsRequest = req.body;

    if (!video_id) {
      return res.status(400).json({ error: 'video_id é obrigatório' });
    }

    // Inicializar Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://gswvicwtswokyfbgoxps.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      return res.status(500).json({ error: 'Supabase não configurado' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar vídeo e transcrição
    const { data: video, error: videoError } = await supabase
      .from('company_videos')
      .select('id, transcription_text, transcription_status')
      .eq('id', video_id)
      .single();

    if (videoError || !video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    if (video.transcription_status !== 'completed' || !video.transcription_text) {
      return res.status(400).json({ 
        error: 'Vídeo não possui transcrição completa. Transcreva o vídeo primeiro.' 
      });
    }

    // Verificar se já existem embeddings para este vídeo
    const { data: existingEmbeddings } = await supabase
      .from('video_embeddings')
      .select('id')
      .eq('video_id', video_id)
      .limit(1);

    if (existingEmbeddings && existingEmbeddings.length > 0) {
      // Deletar embeddings antigos antes de criar novos
      await supabase
        .from('video_embeddings')
        .delete()
        .eq('video_id', video_id);
    }

    // Dividir transcrição em chunks
    const chunks = chunkText(video.transcription_text);
    console.log(`[Embeddings] Gerando embeddings para ${chunks.length} chunks do vídeo ${video_id}`);

    // Gerar embeddings para cada chunk
    const embeddingsToInsert = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const embedding = await generateEmbedding(chunk);
        
        embeddingsToInsert.push({
          video_id: video_id,
          chunk_text: chunk,
          chunk_index: i,
          embedding: embedding, // Supabase converterá automaticamente para vector
        });

        // Pequeno delay para evitar rate limits
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        console.error(`[Embeddings] Erro ao gerar embedding para chunk ${i}:`, error);
        // Continuar com os outros chunks mesmo se um falhar
      }
    }

    if (embeddingsToInsert.length === 0) {
      return res.status(500).json({ error: 'Não foi possível gerar embeddings' });
    }

    // Inserir embeddings no banco
    // O Supabase converterá automaticamente o array para o tipo vector
    const { error: insertError } = await supabase
      .from('video_embeddings')
      .insert(embeddingsToInsert);

    if (insertError) {
      console.error('[Embeddings] Erro ao inserir embeddings:', insertError);
      return res.status(500).json({ 
        error: 'Erro ao salvar embeddings no banco de dados',
        details: insertError.message 
      });
    }

    return res.status(200).json({
      success: true,
      chunks_processed: embeddingsToInsert.length,
      total_chunks: chunks.length,
    });
  } catch (error: any) {
    console.error('[Embeddings] Erro ao processar embeddings:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao processar embeddings',
    });
  }
}
