
import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonVideoProps {
  videoUrl: string | null;
  title: string;
}

export const LessonVideo: React.FC<LessonVideoProps> = ({ videoUrl, title }) => {
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);

  useEffect(() => {
    // Reset error state when changing video
    setVideoError(false);
    setVideoLoading(true);
  }, [videoUrl]);

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
    setVideoError(false);
  };

  // Extract the ID of the YouTube video
  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Convert URL to secure embed format
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // If it's already an embed URL, convert to nocookie
    if (url.includes('youtube.com/embed/')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    
    // YouTube: convert standard URL to nocookie format
    if (url.includes('youtube.com/watch')) {
      const videoId = getYoutubeVideoId(url);
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }
    
    // YouTube: convert short URL to nocookie format
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }
    
    // If not YouTube, return the original URL
    return url;
  };

  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

  return (
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
              src={embedUrl}
              className="w-full h-full"
              style={{ display: videoError ? 'none' : 'block' }}
              allowFullScreen
              title={title}
              onError={handleVideoError}
              onLoad={handleVideoLoad}
            ></iframe>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Conteúdo do vídeo não disponível</p>
        </div>
      )}
    </div>
  );
};
