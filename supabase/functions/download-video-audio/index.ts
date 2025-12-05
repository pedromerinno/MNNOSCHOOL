import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
 * Baixa áudio de um vídeo do YouTube
 * Tenta múltiplas abordagens para garantir compatibilidade
 */
async function downloadYouTubeAudio(videoId: string): Promise<Uint8Array | null> {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Opção 1: Usar serviço yt-dlp configurado (se disponível)
    const ytDlpApiUrl = Deno.env.get('YT_DLP_API_URL');
    if (ytDlpApiUrl) {
      try {
        console.log(`[YouTube] Tentando via yt-dlp API: ${ytDlpApiUrl}`);
        const response = await fetch(`${ytDlpApiUrl}/api/download?url=${encodeURIComponent(videoUrl)}&format=bestaudio`, {
          method: 'GET',
          headers: {
            'Accept': 'audio/*',
          },
        });

        if (response.ok && response.headers.get('content-type')?.includes('audio')) {
          const arrayBuffer = await response.arrayBuffer();
          console.log(`[YouTube] Áudio baixado via yt-dlp: ${arrayBuffer.byteLength} bytes`);
          return new Uint8Array(arrayBuffer);
        }
      } catch (error) {
        console.warn(`[YouTube] Erro ao usar yt-dlp API:`, error);
      }
    }

    // Opção 2: Usar serviço público de extração de áudio
    // Nota: Estes serviços podem ter limitações de uso
    try {
      // Usar um serviço como yt-api ou similar
      // IMPORTANTE: Configure seu próprio serviço para produção
      const publicApiUrl = Deno.env.get('YOUTUBE_AUDIO_API_URL');
      
      if (publicApiUrl) {
        console.log(`[YouTube] Tentando via API pública: ${publicApiUrl}`);
        const response = await fetch(`${publicApiUrl}?url=${encodeURIComponent(videoUrl)}`, {
          method: 'GET',
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          console.log(`[YouTube] Áudio baixado via API pública: ${arrayBuffer.byteLength} bytes`);
          return new Uint8Array(arrayBuffer);
        }
      }
    } catch (error) {
      console.warn(`[YouTube] Erro ao usar API pública:`, error);
    }

    // Opção 3: Retornar erro informativo
    console.error(`[YouTube] Não foi possível baixar áudio. Configure YT_DLP_API_URL ou YOUTUBE_AUDIO_API_URL`);
    throw new Error(
      'Serviço de download de áudio do YouTube não configurado. ' +
      'Configure YT_DLP_API_URL ou YOUTUBE_AUDIO_API_URL nas variáveis de ambiente da Edge Function.'
    );
  } catch (error) {
    console.error('[YouTube] Erro ao baixar áudio:', error);
    throw error;
  }
}

/**
 * Baixa áudio de um vídeo do Loom usando a API
 */
async function downloadLoomAudio(videoId: string): Promise<Uint8Array | null> {
  try {
    const apiKey = Deno.env.get('LOOM_API_KEY');
    if (!apiKey) {
      throw new Error('LOOM_API_KEY não configurada');
    }

    // Buscar informações do vídeo
    const videoResponse = await fetch(`https://api.loom.com/v1/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!videoResponse.ok) {
      throw new Error(`Loom API error: ${videoResponse.statusText}`);
    }

    const videoData = await videoResponse.json();
    
    // Verificar se há URL de download
    // A API do Loom pode fornecer uma URL de download de vídeo
    const downloadUrl = videoData.download_url || videoData.video_url;
    
    if (!downloadUrl) {
      console.warn('[Loom] Vídeo não possui URL de download disponível');
      return null;
    }

    // Baixar o vídeo/áudio
    const audioResponse = await fetch(downloadUrl);
    
    if (!audioResponse.ok) {
      throw new Error(`Erro ao baixar arquivo do Loom: ${audioResponse.statusText}`);
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('[Loom] Erro ao baixar áudio:', error);
    return null;
  }
}

/**
 * Converte áudio para formato base64 para transmissão
 */
function audioToBase64(audio: Uint8Array): string {
  const binary = String.fromCharCode(...audio);
  return btoa(binary);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { video_url } = await req.json();
    
    if (!video_url || typeof video_url !== 'string') {
      throw new Error('video_url é obrigatório e deve ser uma string');
    }

    console.log(`[Download Audio] Processando URL: ${video_url}`);

    // Identificar tipo de vídeo
    const youtubeId = getYoutubeVideoId(video_url);
    const loomId = getLoomVideoId(video_url);

    let audioData: Uint8Array | null = null;
    let videoType: string;

    if (youtubeId) {
      console.log(`[Download Audio] Vídeo do YouTube detectado: ${youtubeId}`);
      audioData = await downloadYouTubeAudio(youtubeId);
      videoType = 'youtube';
    } else if (loomId) {
      console.log(`[Download Audio] Vídeo do Loom detectado: ${loomId}`);
      audioData = await downloadLoomAudio(loomId);
      videoType = 'loom';
    } else {
      throw new Error('URL de vídeo não suportada. Apenas YouTube e Loom são suportados.');
    }

    if (!audioData || audioData.length === 0) {
      throw new Error(`Não foi possível baixar o áudio do vídeo ${videoType}. Verifique se o serviço está configurado corretamente.`);
    }

    console.log(`[Download Audio] Áudio baixado com sucesso: ${audioData.length} bytes`);

    // Converter para base64 para transmissão
    const base64Audio = audioToBase64(audioData);

    return new Response(
      JSON.stringify({
        success: true,
        audio_base64: base64Audio,
        audio_size: audioData.length,
        video_type: videoType,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    );
  } catch (error) {
    console.error('[Download Audio] Erro:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro ao processar requisição'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    );
  }
});
