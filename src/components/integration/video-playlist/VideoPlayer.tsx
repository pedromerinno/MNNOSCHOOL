
import React, { useState } from 'react';
import { ExternalLink, AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getYoutubeVideoId, getEmbedUrl, getLoomVideoId } from './utils';
import VideoPlayerStyled from "@/components/ui/video-player";

interface VideoPlayerProps {
  videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl
}) => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Detectar tipo de vídeo - PRIORIDADE: YouTube e Loom sempre usam iframe
  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  const isLoom = videoUrl && videoUrl.includes('loom.com');

  // Resetar estados do vídeo ao trocar de vídeo
  React.useEffect(() => {
    if (!videoUrl) {
      setVideoLoading(false);
      return;
    }

    setVideoError(false);
    setVideoLoading(true);
    
    // Timeout de segurança - se o onLoad não disparar, esconder loading após 5 segundos
    const timeout = setTimeout(() => {
      setVideoLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [videoUrl, isLoom]);

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoError(false);
    setVideoLoading(false);
  };
  
  // Vídeo direto: URLs que terminam com extensões de vídeo conhecidas
  // Só usar player estilizado se for realmente um arquivo de vídeo direto
  const isDirectVideo = videoUrl && !isYouTube && !isLoom && (
    /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)(\?|#|$)/i.test(videoUrl) ||
    videoUrl.match(/^https?:\/\/.*\/.*\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)/i)
  );

  const embedUrl = getEmbedUrl(videoUrl);
  
  // YouTube e Loom SEMPRE usam iframe, nunca o player estilizado
  const shouldUseDirectVideo = isDirectVideo && !isYouTube && !isLoom;
  
  // Debug: verificar detecção (remover em produção se necessário)
  React.useEffect(() => {
    if (videoUrl) {
      console.log('Video URL:', videoUrl);
      console.log('Is YouTube:', isYouTube);
      console.log('Is Loom:', isLoom);
      console.log('Is Direct Video:', isDirectVideo);
      console.log('Should Use Direct Video:', shouldUseDirectVideo);
      console.log('Embed URL:', embedUrl);
    }
  }, [videoUrl, isYouTube, isLoom, isDirectVideo, shouldUseDirectVideo, embedUrl]);

  return (
    <div className="aspect-video bg-black/5 dark:bg-black/20 relative rounded-2xl overflow-hidden">
        {videoUrl ? (
          <>
            {/* Usar o novo player estilizado para vídeos diretos */}
            {shouldUseDirectVideo ? (
              <>
                <div className="absolute inset-0 w-full h-full">
                  <VideoPlayerStyled 
                    src={videoUrl} 
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
                {!shouldUseDirectVideo && (embedUrl || videoUrl) && (
                  <iframe 
                    key={embedUrl || videoUrl} // Key para forçar re-render quando URL mudar
                    src={embedUrl || videoUrl} 
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
