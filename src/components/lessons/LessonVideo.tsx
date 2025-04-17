
import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, AlertCircle, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LessonVideoProps {
  videoUrl: string | null;
  title: string;
  onVideoEnd?: () => void;
  autoplay?: boolean;
  showAutoplayPrompt?: boolean;
  onToggleAutoplay?: () => void;
  nextLessonTitle?: string;
}

export const LessonVideo: React.FC<LessonVideoProps> = ({ 
  videoUrl, 
  title,
  onVideoEnd,
  autoplay = true,
  showAutoplayPrompt = false,
  onToggleAutoplay,
  nextLessonTitle
}) => {
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setVideoError(false);
    setVideoLoading(true);
  }, [videoUrl]);

  useEffect(() => {
    // Setup message event listener for YouTube iframe API
    const handleYouTubeEvents = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          // YouTube iframe API sends events as JSON with an event property
          if (data.event === 'onStateChange' && data.info === 0) { // 0 = ended
            console.log('Video ended event detected');
            if (onVideoEnd) {
              onVideoEnd();
            }
          }
        } catch (e) {
          // Not a JSON message or not from YouTube iframe API
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
    console.log('Native video ended event fired');
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    if (url.includes('youtube.com/embed/')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
    }
    
    if (url.includes('youtube.com/watch')) {
      const videoId = getYoutubeVideoId(url);
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}` : null;
    }
    
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}` : null;
    }
    
    return url;
  };

  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

  return (
    <div className="relative">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
        {videoUrl ? (
          <>
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
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
            ) : videoError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Erro ao carregar o vídeo</h3>
                <p className="text-muted-foreground mb-4">
                  Não foi possível carregar o conteúdo do vídeo.
                </p>
              </div>
            ) : null}
            
            {embedUrl && (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full"
                style={{ display: videoError ? 'none' : 'block' }}
                allowFullScreen
                title={title}
                onError={handleVideoError}
                onLoad={handleVideoLoad}
                onEnded={handleVideoEnded}
              ></iframe>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Conteúdo do vídeo não disponível</p>
          </div>
        )}
      </div>

      {onToggleAutoplay && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleAutoplay}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            {autoplay ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Autoplay ON
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Autoplay OFF
              </>
            )}
          </Button>
        </div>
      )}

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
