import React, { useState } from 'react';
import { CardContent } from "@/components/ui/card";
import { ExternalLink, AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getYoutubeVideoId, getEmbedUrl } from './utils';
interface VideoPlayerProps {
  videoUrl: string;
  description: string;
}
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  description
}) => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Resetar estados do vídeo ao trocar de vídeo
  React.useEffect(() => {
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
  const embedUrl = getEmbedUrl(videoUrl);
  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  return <>
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
        {videoUrl ? <>
            {videoLoading && <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary border-r-2 rounded-full"></div>
              </div>}
            
            {videoError && isYouTube ? <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
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
              </div> : videoError ? <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Erro ao carregar o vídeo</h3>
                <p className="text-muted-foreground mb-4">
                  Não foi possível carregar o conteúdo do vídeo.
                </p>
              </div> : null}
            
            {embedUrl && <iframe src={embedUrl} className="w-full h-full" style={{
          display: videoError ? 'none' : 'block'
        }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Vídeo de integração" onError={handleVideoError} onLoad={handleVideoLoad} />}
          </> : <div className="flex flex-col items-center justify-center h-full">
            <Video className="h-16 w-16 text-gray-400" />
            <p className="text-gray-500 mt-4">Nenhum vídeo selecionado</p>
          </div>}
      </div>
      
      <CardContent className="p-4">
        <div className="mt-2">
          <p className="text-zinc-400 py-[20px]">
            {description || "Sem descrição disponível."}
          </p>
        </div>
      </CardContent>
    </>;
};