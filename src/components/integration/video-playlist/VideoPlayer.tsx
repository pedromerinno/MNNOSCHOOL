
import React, { useState } from 'react';
import { ExternalLink, AlertCircle, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getYoutubeVideoId, getEmbedUrl, getLoomVideoId } from './utils';
import VideoPlayerStyled from "@/components/ui/video-player";
import { useMuxVideoUrl } from "@/hooks/useMuxVideoUrl";
import { lazy, Suspense } from 'react';

// Lazy load Mux Player
const MuxPlayer = lazy(() => 
  import('@mux/mux-player-react')
);

interface VideoPlayerProps {
  videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl
}) => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Resolver mux-video-<id> em URL de playback
  const { url: muxPlaybackUrl, playbackId, muxStatus, thumbnailUrl } = useMuxVideoUrl(videoUrl);
  
  // URL final: se for mux-video-<id>, usar a URL resolvida; senão, usar a URL original
  const finalVideoUrl = videoUrl?.startsWith('mux-video-') ? muxPlaybackUrl : videoUrl;
  
  const isMuxVideo = videoUrl?.startsWith('mux-video-');
  const isMuxPending = isMuxVideo && muxStatus !== 'ready';

  // Detectar tipo de vídeo - PRIORIDADE: YouTube e Loom sempre usam iframe
  const isYouTube = finalVideoUrl && (finalVideoUrl.includes('youtube.com') || finalVideoUrl.includes('youtu.be'));
  const isLoom = finalVideoUrl && finalVideoUrl.includes('loom.com');

  // Resetar estados do vídeo ao trocar de vídeo - otimizado
  React.useEffect(() => {
    if (!videoUrl) {
      setVideoLoading(false);
      setVideoError(false);
      return;
    }

    // Reset imediato para permitir transição rápida
    setVideoError(false);
    setVideoLoading(true);
    
    // Timeout reduzido para melhor UX
    const timeout = setTimeout(() => {
      setVideoLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [videoUrl]);

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoError(false);
    setVideoLoading(false);
  };
  
  // Vídeo direto: URLs que terminam com extensões de vídeo conhecidas ou são Mux
  // Só usar player estilizado se for realmente um arquivo de vídeo direto ou Mux
  const isDirectVideo = finalVideoUrl && !isYouTube && !isLoom && (
    /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v|m3u8)(\?|#|$)/i.test(finalVideoUrl) ||
    finalVideoUrl.match(/^https?:\/\/.*\/.*\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v|m3u8)/i) ||
    isMuxVideo
  );

  const embedUrl = getEmbedUrl(finalVideoUrl || videoUrl);
  
  // YouTube e Loom SEMPRE usam iframe, nunca o player estilizado
  const shouldUseDirectVideo = isDirectVideo && !isYouTube && !isLoom;
  

  return (
    <div className="aspect-video bg-black/5 dark:bg-black/20 relative rounded-2xl overflow-hidden">
        {videoUrl ? (
          <>
            {/* Loading para Mux pendente */}
            {isMuxPending && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-medium mb-2">Processando vídeo</h3>
                <p className="text-muted-foreground">
                  {muxStatus === 'uploading' && 'Enviando arquivo...'}
                  {muxStatus === 'processing' && 'Preparando para playback...'}
                  {(!muxStatus || muxStatus === 'unknown' || muxStatus === 'idle') && 'Aguardando processamento...'}
                  {muxStatus === 'errored' && 'Erro ao processar vídeo'}
                </p>
              </div>
            )}

            {/* Vídeo Mux pronto - sempre usar player customizado */}
            {isMuxVideo && muxStatus === 'ready' && playbackId && !isMuxPending && muxPlaybackUrl ? (
              <div key={`mux-${playbackId}`} className="absolute inset-0 w-full h-full">
                <VideoPlayerStyled 
                  src={muxPlaybackUrl} 
                  fullWidth 
                  onLoad={handleVideoLoad}
                  onError={handleVideoError}
                />
              </div>
            ) : shouldUseDirectVideo ? (
              <>
                <div key={`direct-${finalVideoUrl || videoUrl}`} className="absolute inset-0 w-full h-full">
                  <VideoPlayerStyled 
                    src={finalVideoUrl || videoUrl} 
                    fullWidth 
                    onLoad={handleVideoLoad}
                    onError={handleVideoError}
                  />
                </div>
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-sm z-20">
                    <div className="animate-spin h-8 w-8 border-t-2 border-primary border-r-2 rounded-full"></div>
                  </div>
                )}
              </>
            ) : (
              <>
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 z-10">
                    <div className="animate-spin h-8 w-8 border-t-2 border-primary border-r-2 rounded-full"></div>
                  </div>
                )}
                
                {videoError && isYouTube ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">A conexão com YouTube foi recusada</h3>
                    <p className="text-muted-foreground mb-4">
                      Isso pode ocorrer devido a bloqueios de rede ou restrições de privacidade.
                    </p>
                    <Button asChild variant="outline">
                      <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Assistir diretamente no YouTube
                      </a>
                    </Button>
                  </div>
                ) : videoError && isLoom ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">A conexão com Loom foi recusada</h3>
                    <p className="text-muted-foreground mb-4">
                      Isso pode ocorrer devido a bloqueios de rede, cookies de terceiros ou restrições de privacidade.
                    </p>
                    <Button asChild variant="outline">
                      <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Assistir diretamente no Loom
                      </a>
                    </Button>
                  </div>
                ) : videoError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Erro ao carregar o vídeo</h3>
                    <p className="text-muted-foreground mb-4">
                      Não foi possível carregar o conteúdo do vídeo.
                    </p>
                  </div>
                ) : null}
                
                {/* Renderizar iframe para YouTube/Loom - sempre que não for vídeo direto */}
                {!shouldUseDirectVideo && !isMuxVideo && (embedUrl || finalVideoUrl || videoUrl) && (
                  <iframe 
                    key={`iframe-${embedUrl || finalVideoUrl || videoUrl}`} 
                    src={embedUrl || finalVideoUrl || videoUrl} 
                    className="w-full h-full border-0 rounded-2xl" 
                    style={{
                      display: videoError ? 'none' : 'block'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                    allowFullScreen 
                    title="Vídeo de integração" 
                    onError={handleVideoError} 
                    onLoad={handleVideoLoad}
                    loading="lazy"
                    frameBorder="0"
                    referrerPolicy="origin"
                  />
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Video className="h-16 w-16 text-gray-400" />
            <p className="text-gray-500 mt-4">Nenhum vídeo selecionado</p>
          </div>
        )}
    </div>
  );
};
