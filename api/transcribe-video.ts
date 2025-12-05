import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface TranscribeRequest {
  video_id: string;
  video_url: string;
  table_type?: 'lessons' | 'company_videos'; // Tipo de tabela: 'lessons' ou 'company_videos' (padrão)
}

/**
 * Extrai o ID do vídeo do YouTube
 */
function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Extrai o ID do vídeo do Loom
 */
function getLoomVideoId(url: string): string | null {
  const shareRegExp = /^.*loom\.com\/share\/([a-zA-Z0-9_-]+)/;
  const shareMatch = url.match(shareRegExp);
  if (shareMatch && shareMatch[1]) {
    return shareMatch[1];
  }
  const embedRegExp = /^.*loom\.com\/embed\/([a-zA-Z0-9_-]+)/;
  const embedMatch = url.match(embedRegExp);
  return embedMatch ? embedMatch[1] : null;
}

/**
 * Baixa áudio de um vídeo do Loom usando a API diretamente
 */
async function downloadLoomAudio(videoId: string): Promise<Buffer | null> {
  try {
    const loomApiKey = process.env.LOOM_API_KEY;
    if (!loomApiKey) {
      throw new Error('LOOM_API_KEY não configurada. Configure a variável de ambiente LOOM_API_KEY no arquivo .env local ou nas variáveis de ambiente do Vercel.');
    }

    console.log(`[Transcribe] Buscando informações do vídeo Loom: ${videoId}`);
    const apiUrl = `https://api.loom.com/v1/videos/${videoId}`;
    
    // Buscar informações do vídeo
    const videoResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${loomApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Transcribe] Resposta da API Loom:`, { 
      status: videoResponse.status, 
      statusText: videoResponse.statusText,
      ok: videoResponse.ok 
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text().catch(() => '');
      console.error(`[Transcribe] Erro na API Loom:`, errorText);
      throw new Error(`Loom API error: ${videoResponse.status} ${videoResponse.statusText}`);
    }

    const videoData = await videoResponse.json();
    console.log(`[Transcribe] Dados do vídeo recebidos:`, { 
      hasDownloadUrl: !!videoData.download_url,
      hasVideoUrl: !!videoData.video_url,
      hasStreamUrl: !!videoData.stream_url,
      title: videoData.name || videoData.title,
      keys: Object.keys(videoData)
    });
    
    // A API do Loom pode retornar diferentes campos para URL do vídeo
    const downloadUrl = videoData.download_url || 
                        videoData.video_url || 
                        videoData.stream_url ||
                        (videoData.assets && videoData.assets.video_url) ||
                        (videoData.media && videoData.media.video_url);
    
    if (!downloadUrl) {
      console.warn('[Transcribe] Vídeo não possui URL de download disponível');
      console.warn('[Transcribe] Dados completos recebidos:', JSON.stringify(videoData, null, 2));
      throw new Error('Vídeo do Loom não possui URL de download disponível na resposta da API. A API do Loom pode não fornecer download direto. Verifique a documentação da API do Loom.');
    }

    console.log(`[Transcribe] Baixando vídeo de: ${downloadUrl}`);
    // Baixar o vídeo/áudio
    const audioResponse = await fetch(downloadUrl);
    
    console.log(`[Transcribe] Resposta do download:`, { 
      status: audioResponse.status, 
      statusText: audioResponse.statusText,
      ok: audioResponse.ok,
      contentType: audioResponse.headers.get('content-type')
    });
    
    if (!audioResponse.ok) {
      throw new Error(`Erro ao baixar arquivo do Loom: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    console.log(`[Transcribe] Áudio baixado com sucesso: ${audioBuffer.length} bytes`);
    return audioBuffer;
  } catch (error: any) {
    console.error('[Transcribe] Erro ao baixar áudio do Loom:', error);
    throw error;
  }
}

/**
 * Baixa o áudio de um vídeo usando a Edge Function do Supabase (para YouTube)
 * ou diretamente via API (para Loom)
 */
async function downloadVideoAudio(videoUrl: string): Promise<Buffer | null> {
  const youtubeId = getYoutubeVideoId(videoUrl);
  const loomId = getLoomVideoId(videoUrl);

  // Para Loom, fazer download diretamente na API route (melhor conectividade)
  if (loomId) {
    console.log('[Transcribe] Detectado vídeo do Loom, fazendo download direto');
    return await downloadLoomAudio(loomId);
  }

  // Para YouTube, usar Edge Function (se configurada) ou retornar erro
  if (youtubeId) {
    console.log('[Transcribe] Detectado vídeo do YouTube, usando Edge Function');
    try {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gswvicwtswokyfbgoxps.supabase.co';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd3ZpY3d0c3dva3lmYmdveHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MDQ4MTksImV4cCI6MjA1OTQ4MDgxOX0.kyN2Qq3v9H_ENVzSH4QfGwUJLCVEXIo44-MQImFQ_Z0';
      
      if (!supabaseAnonKey) {
        throw new Error('Supabase keys não configuradas');
      }

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/download-video-audio`;
      console.log('[Transcribe] Chamando Edge Function:', edgeFunctionUrl);

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ video_url: videoUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || response.statusText };
        }
        
        if (response.status === 404) {
          throw new Error(`Edge Function 'download-video-audio' não encontrada. Verifique se ela foi deployada no Supabase.`);
        }
        
        const errorMessage = errorData.error || errorData.message || `Erro na Edge Function: ${response.statusText} (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success || !data.audio_base64) {
        throw new Error(data.error || 'Edge Function não retornou áudio válido');
      }

      const audioBuffer = Buffer.from(data.audio_base64, 'base64');
      console.log(`[Transcribe] Áudio baixado: ${audioBuffer.length} bytes (YouTube)`);
      return audioBuffer;
    } catch (error) {
      console.error('[Transcribe] Erro ao baixar áudio do YouTube via Edge Function:', error);
      throw error;
    }
  }

  throw new Error('URL de vídeo não suportada. Apenas YouTube e Loom são suportados.');
}

/**
 * Transcreve áudio usando OpenAI Whisper API
 */
async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<{
  text: string;
  language?: string;
  duration?: number;
}> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  // Criar um FormData para enviar o arquivo
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  formData.append('file', blob, filename);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    text: data.text,
    language: data.language,
    duration: data.duration,
  };
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

  // Capturar variáveis do request antes do try para usar no catch
  let video_id: string | undefined;
  let table_type: 'lessons' | 'company_videos' = 'company_videos';
  
  try {
    console.log('[Transcribe] Recebida requisição:', { 
      method: req.method,
      body: req.body,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });

    const requestData: TranscribeRequest = req.body;
    video_id = requestData.video_id;
    table_type = requestData.table_type || 'company_videos';
    const video_url = requestData.video_url;

    if (!video_id || !video_url) {
      console.error('[Transcribe] Parâmetros faltando:', { video_id: !!video_id, video_url: !!video_url });
      return res.status(400).json({ error: 'video_id e video_url são obrigatórios' });
    }

    // Validar table_type
    if (table_type !== 'lessons' && table_type !== 'company_videos') {
      console.error('[Transcribe] table_type inválido:', table_type);
      return res.status(400).json({ error: 'table_type deve ser "lessons" ou "company_videos"' });
    }

    // Inicializar Supabase
    // Em desenvolvimento local, usar a chave anon do cliente se SERVICE_ROLE não estiver disponível
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gswvicwtswokyfbgoxps.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd3ZpY3d0c3dva3lmYmdveHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MDQ4MTksImV4cCI6MjA1OTQ4MDgxOX0.kyN2Qq3v9H_ENVzSH4QfGwUJLCVEXIo44-MQImFQ_Z0';
    const supabaseKey = supabaseServiceKey || supabaseAnonKey;
    
    if (!supabaseKey) {
      console.error('[Transcribe] SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY não configurado');
      return res.status(500).json({ 
        error: 'Supabase não configurado. Verifique as variáveis de ambiente SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY' 
      });
    }

    // Verificar se OPENAI_API_KEY está configurada
    const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!openaiKey) {
      console.error('[Transcribe] OPENAI_API_KEY não configurado');
      return res.status(500).json({ 
        error: 'OPENAI_API_KEY não configurada. Configure a variável de ambiente OPENAI_API_KEY no arquivo .env local' 
      });
    }

    // Verificar se LOOM_API_KEY está configurada (se for vídeo do Loom)
    const loomId = getLoomVideoId(video_url);
    if (loomId) {
      const loomApiKey = process.env.LOOM_API_KEY;
      if (!loomApiKey) {
        console.error('[Transcribe] LOOM_API_KEY não configurada para vídeo do Loom');
        return res.status(500).json({ 
          error: 'LOOM_API_KEY não configurada. Configure a variável de ambiente LOOM_API_KEY no arquivo .env local ou nas variáveis de ambiente do Vercel.' 
        });
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Atualizar status para processing
    await supabase
      .from(table_type)
      .update({
        transcription_status: 'processing',
        transcription_error: null,
      })
      .eq('id', video_id);

    // Baixar áudio usando Edge Function do Supabase
    const audioBuffer = await downloadVideoAudio(video_url);
    
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Não foi possível baixar o áudio do vídeo. Verifique se a Edge Function está configurada corretamente.');
    }

    // Transcrever áudio
    const youtubeId = getYoutubeVideoId(video_url);
    const loomId = getLoomVideoId(video_url);
    const filename = youtubeId ? `youtube_${youtubeId}.mp3` : `loom_${loomId}.mp3`;
    const transcription = await transcribeAudio(audioBuffer, filename);

    // Salvar transcrição no banco
    const { error: updateError } = await supabase
      .from(table_type)
      .update({
        transcription_text: transcription.text,
        transcription_status: 'completed',
        transcribed_at: new Date().toISOString(),
        transcription_metadata: {
          language: transcription.language,
          duration: transcription.duration,
          transcribed_at: new Date().toISOString(),
        },
      })
      .eq('id', video_id);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      transcription: transcription.text,
      metadata: {
        language: transcription.language,
        duration: transcription.duration,
      },
    });
  } catch (error: any) {
    console.error('[Transcribe] Erro ao processar transcrição:', error);
    console.error('[Transcribe] Stack trace:', error.stack);
    console.error('[Transcribe] Request body:', req.body);

    // Tentar atualizar status de erro no banco
    // Usar variáveis capturadas antes do try
    if (video_id) {
      try {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gswvicwtswokyfbgoxps.supabase.co';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd3ZpY3d0c3dva3lmYmdveHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MDQ4MTksImV4cCI6MjA1OTQ4MDgxOX0.kyN2Qq3v9H_ENVzSH4QfGwUJLCVEXIo44-MQImFQ_Z0';
        const supabaseKey = supabaseServiceKey || supabaseAnonKey;
        
        console.log('[Transcribe] Tentando atualizar status de erro:', { 
          video_id, 
          hasSupabaseKey: !!supabaseKey,
          table_type 
        });
        
        if (supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const updateResult = await supabase
            .from(table_type)
            .update({
              transcription_status: 'failed',
              transcription_error: error.message || 'Erro desconhecido',
            })
            .eq('id', video_id);
          
          if (updateResult.error) {
            console.error('[Transcribe] Erro ao atualizar status no banco:', updateResult.error);
          } else {
            console.log('[Transcribe] Status de erro atualizado no banco com sucesso');
          }
        } else {
          console.error('[Transcribe] Não foi possível atualizar status: falta SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY');
        }
      } catch (updateError: any) {
        console.error('[Transcribe] Erro ao atualizar status de erro:', updateError);
        console.error('[Transcribe] Stack trace do updateError:', updateError.stack);
      }
    } else {
      console.error('[Transcribe] Não foi possível atualizar status: video_id não disponível');
    }

    return res.status(500).json({
      error: error.message || 'Erro ao processar transcrição',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
