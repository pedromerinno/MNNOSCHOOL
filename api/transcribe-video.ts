import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface TranscribeRequest {
  video_id: string;
  video_url: string;
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
 * Baixa o áudio de um vídeo usando a Edge Function do Supabase
 */
async function downloadVideoAudio(videoUrl: string): Promise<Buffer | null> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://gswvicwtswokyfbgoxps.supabase.co';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd3ZpY3d0c3dva3lmYmdveHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MDQ4MTksImV4cCI6MjA1OTQ4MDgxOX0.kyN2Qq3v9H_ENVzSH4QfGwUJLCVEXIo44-MQImFQ_Z0';
    
    if (!supabaseAnonKey) {
      throw new Error('Supabase keys não configuradas');
    }

    // Chamar Edge Function para baixar áudio
    const response = await fetch(`${supabaseUrl}/functions/v1/download-video-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ video_url: videoUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro na Edge Function: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.audio_base64) {
      throw new Error('Edge Function não retornou áudio válido');
    }

    // Converter base64 para Buffer
    const audioBuffer = Buffer.from(data.audio_base64, 'base64');
    console.log(`[Transcribe] Áudio baixado: ${audioBuffer.length} bytes (${data.video_type})`);
    
    return audioBuffer;
  } catch (error) {
    console.error('[Transcribe] Erro ao baixar áudio via Edge Function:', error);
    throw error;
  }
}

/**
 * Transcreve áudio usando OpenAI Whisper API
 */
async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<{
  text: string;
  language?: string;
  duration?: number;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
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

  try {
    const { video_id, video_url }: TranscribeRequest = req.body;

    if (!video_id || !video_url) {
      return res.status(400).json({ error: 'video_id e video_url são obrigatórios' });
    }

    // Inicializar Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://gswvicwtswokyfbgoxps.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      return res.status(500).json({ error: 'Supabase não configurado' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Atualizar status para processing
    await supabase
      .from('company_videos')
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
      .from('company_videos')
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

    // Tentar atualizar status de erro no banco
    try {
      const supabaseUrl = process.env.SUPABASE_URL || 'https://gswvicwtswokyfbgoxps.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (supabaseKey && req.body?.video_id) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from('company_videos')
          .update({
            transcription_status: 'failed',
            transcription_error: error.message || 'Erro desconhecido',
          })
          .eq('id', req.body.video_id);
      }
    } catch (updateError) {
      console.error('[Transcribe] Erro ao atualizar status de erro:', updateError);
    }

    return res.status(500).json({
      error: error.message || 'Erro ao processar transcrição',
    });
  }
}
