
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getEmbedUrl, getLoomVideoId } from "@/components/integration/video-playlist/utils";
import { useMuxVideoUrl } from "@/hooks/useMuxVideoUrl";
import VideoPlayerStyled from "@/components/ui/video-player";

// Lazy load Mux Player com error boundary
const MuxPlayer = lazy(() => 
  import('@mux/mux-player-react').catch((error) => {
    console.error('Failed to load MuxPlayer:', error);
    // Retornar um componente de fallback
    return { 
      default: () => (
        <div className="w-full h-full flex items-center justify-center bg-black text-white">
          <p>Erro ao carregar o player de vídeo</p>
        </div>
      )
    };
  })
);

interface LessonVideoProps {
  videoUrl: string | null;
  title: string;
  onVideoEnd?: () => void;
  showAutoplayPrompt?: boolean;
  nextLessonTitle?: string;
}

export const LessonVideo: React.FC<LessonVideoProps> = ({ 
  videoUrl, 
  title,
  onVideoEnd,
  showAutoplayPrompt,
  nextLessonTitle
}) => {
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Resolver mux-video-<id> em URL de playback
  const { url: muxPlaybackUrl, playbackId, muxStatus, thumbnailUrl } = useMuxVideoUrl(videoUrl);
  
  // URL final: se for mux-video-<id>, usar a URL resolvida; senão, usar a URL original
  const finalVideoUrl = videoUrl?.startsWith('mux-video-') ? muxPlaybackUrl : videoUrl;
  
  const isMuxVideo = videoUrl?.startsWith('mux-video-');

  // Resetar estados ao trocar vídeo - otimizado
  useEffect(() => {
    if (!videoUrl) {
      setVideoLoading(false);
      setVideoError(false);
      return;
    }
    
    setVideoError(false);
    setVideoLoading(true);
    
    // Timeout reduzido para melhor UX
    const timeout = setTimeout(() => {
      setVideoLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [videoUrl]);

  useEffect(() => {
    const handleYouTubeEvents = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'onStateChange' && data.info === 0) {
              if (onVideoEnd) {
                onVideoEnd();
              }
            }
          } catch (e) {
            // Ignore parsing errors for non-YouTube messages
          }
      }
    };

    window.addEventListener('message', handleYouTubeEvents);
    
    return () => {
      window.removeEventListener('message', handleYouTubeEvents);
    };
  }, [onVideoEnd]);

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoEnded = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const isYouTube = finalVideoUrl && (finalVideoUrl.includes('youtube.com') || finalVideoUrl.includes('youtu.be'));
  const isLoom = finalVideoUrl && finalVideoUrl.includes('loom.com');
  const isMuxPending = isMuxVideo && muxStatus !== 'ready';
  const embedUrl = finalVideoUrl ? getEmbedUrl(finalVideoUrl) : null;

  return (
    <div className="w-full">
      <div className="aspect-[16/9] bg-black overflow-hidden relative w-full max-w-full mx-auto">
        {videoUrl ? (
          <>
            {videoLoading && !isMuxPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="animate-spin h-12 w-12 border-t-2 border-primary border-r-2 rounded-full"></div>
              </div>
            )}

            {isMuxPending ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-medium mb-2 text-white">Processando vídeo</h3>
                <p className="text-muted-foreground">
                  {muxStatus === 'uploading' && 'Enviando arquivo...'}
                  {muxStatus === 'processing' && 'Preparando para playback...'}
                  {(!muxStatus || muxStatus === 'unknown' || muxStatus === 'idle') && 'Aguardando processamento...'}
                  {muxStatus === 'errored' && 'Erro ao processar vídeo'}
                  {muxStatus && !['uploading', 'processing', 'unknown', 'idle', 'ready', 'errored'].includes(muxStatus) && 'O vídeo está sendo processado. Isso pode levar alguns minutos.'}
                </p>
              </div>
            ) : isMuxVideo ? (
              // Para vídeos Mux, usar player customizado quando URL disponível
              muxStatus === 'ready' && playbackId && muxPlaybackUrl ? (
                <div key={`mux-lesson-${playbackId}`} className="absolute inset-0 w-full h-full">
                  <VideoPlayerStyled 
                    src={muxPlaybackUrl} 
                    fullWidth 
                    onLoad={handleVideoLoad}
                    onError={handleVideoError}
                  />
                </div>
              ) : muxStatus === 'ready' && playbackId ? (
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="ml-4 text-white">Carregando player...</p>
                  </div>
                }>
                  <div className="absolute inset-0 w-full h-full">
                    <MuxPlayer
                      key={`mux-player-${playbackId}`}
                      playbackId={playbackId}
                      streamType="on-demand"
                      metadata={{
                        video_title: title,
                      }}
                      controls
                      autoPlay={false}
                      onPlay={() => {
                        setVideoLoading(false);
                        setVideoError(false);
                      }}
                      onError={handleVideoError}
                      onEnded={handleVideoEnded}
                      onLoadedData={handleVideoLoad}
                      className="w-full h-full"
                      style={{ width: '100%', height: '100%', display: 'block' }}
                    />
                  </div>
                </Suspense>
              ) : (
                // Se Mux não está pronto, mostrar mensagem de erro
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Vídeo não está pronto</h3>
                  <p className="text-muted-foreground mb-4">
                    Status: {muxStatus} | PlaybackId: {playbackId ? 'Sim' : 'Não'}
                  </p>
                  <p className="text-muted-foreground">
                    O vídeo ainda está sendo processado. Por favor, tente novamente em alguns instantes.
                  </p>
                </div>
              )
            ) : videoError && isYouTube ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">A conexão com YouTube foi recusada</h3>
                <p className="text-muted-foreground mb-4">
                  Isso pode ocorrer devido a bloqueios de rede ou restrições de privacidade.
                </p>
                <Button asChild variant="outline">
                  <a href={finalVideoUrl || videoUrl || '#'} target="_blank" rel="noopener noreferrer">
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
                  <a href={finalVideoUrl || videoUrl || '#'} target="_blank" rel="noopener noreferrer">
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
            
            {/* Renderizar iframe apenas para YouTube/Loom, nunca para Mux */}
            {!isMuxVideo && embedUrl && finalVideoUrl && (
              <iframe
                key={`iframe-lesson-${embedUrl}`}
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full"
                style={{ display: videoError ? 'none' : 'block' }}
                allowFullScreen
                title={title}
                onError={handleVideoError}
                onLoad={handleVideoLoad}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="origin"
                loading="lazy"
              ></iframe>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Conteúdo do vídeo não disponível</p>
          </div>
        )}
      </div>

      {showAutoplayPrompt && nextLessonTitle && (
        <Alert className="absolute bottom-4 right-4 w-72 bg-black/80 text-white border-none">
          <AlertDescription className="text-white">
            Próxima aula em 5 segundos: {nextLessonTitle}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
