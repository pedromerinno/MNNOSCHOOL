
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Info, List, Video, ExternalLink, AlertCircle } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompanyVideo {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  duration: string | null;
  order_index: number;
}

interface VideoPlaylistProps {
  companyId?: string;
  mainVideo: string;
  mainVideoDescription: string;
}

export const VideoPlaylist: React.FC<VideoPlaylistProps> = ({ 
  companyId,
  mainVideo,
  mainVideoDescription
}) => {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  // State for videos from the database
  const [videos, setVideos] = useState<CompanyVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  
  // Inicializar com o vídeo principal ou com o primeiro vídeo da playlist
  const initialVideo = mainVideo || (videos.length > 0 ? videos[0].video_url : '');
  const initialDescription = mainVideoDescription || (videos.length > 0 ? videos[0].description || '' : '');
  
  const [currentVideo, setCurrentVideo] = useState(initialVideo);
  const [currentDescription, setCurrentDescription] = useState(initialDescription);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

  // Resetar estados do vídeo ao trocar de vídeo
  useEffect(() => {
    setVideoError(false);
    setVideoLoading(true);
  }, [currentVideo]);

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      if (!companyId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('company_videos')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index');
          
        if (error) throw error;
        
        setVideos(data || []);
        
        // If we have videos and no current video is set, set the first one
        if (data && data.length > 0 && !currentVideo) {
          setCurrentVideo(data[0].video_url);
          setCurrentDescription(data[0].description || '');
        }
      } catch (error) {
        console.error("Error fetching company videos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideos();
  }, [companyId]);

  // Update initialVideo and initialDescription when videos are loaded
  useEffect(() => {
    // Only update if we don't have a current video yet
    if (!currentVideo && videos.length > 0) {
      setCurrentVideo(videos[0].video_url);
      setCurrentDescription(videos[0].description || '');
    }
  }, [videos]);

  // Função para selecionar um vídeo da playlist
  const handleSelectVideo = (video: CompanyVideo, index: number) => {
    setCurrentVideo(video.video_url);
    setCurrentDescription(video.description || '');
    setSelectedVideoIndex(index);
  };

  // Extrair o ID do vídeo do YouTube
  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Formatamos o URL do vídeo para garantir que ele funcione como um embed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Se já for um URL de embed, transformar para nocookie
    if (url.includes('youtube.com/embed/')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    
    // YouTube: converter URL padrão para formato nocookie
    if (url.includes('youtube.com/watch')) {
      const videoId = getYoutubeVideoId(url);
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
    }
    
    // YouTube: converter URL curta para formato nocookie
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
    }
    
    // Se não for YouTube, retornar a URL original
    return url;
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
    setVideoError(false);
  };

  const embedUrl = getEmbedUrl(currentVideo);
  const isYouTube = currentVideo && (currentVideo.includes('youtube.com') || currentVideo.includes('youtu.be'));

  // If no videos are available and no main video, display a message
  if (!mainVideo && videos.length === 0 && !isLoading) {
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-12 text-center">
            <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Sem vídeos disponíveis</h3>
            <p className="text-gray-500">
              Não há vídeos de integração disponíveis para esta empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
              {embedUrl ? (
                <>
                  {videoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
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
                        <a href={currentVideo} target="_blank" rel="noopener noreferrer">
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
                  
                  <iframe 
                    src={embedUrl}
                    className="w-full h-full"
                    style={{ display: videoError ? 'none' : 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Vídeo de integração"
                    onError={handleVideoError}
                    onLoad={handleVideoLoad}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Video className="h-16 w-16 text-gray-400" />
                  <p className="text-gray-500 mt-4">Nenhum vídeo selecionado</p>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="mt-2">
                <p className="text-gray-700 dark:text-gray-300">
                  {currentDescription || "Sem descrição disponível."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <List className="h-5 w-5 mr-2" style={{ color: companyColor }} />
                <h3 className="font-medium">Playlist de vídeos</h3>
              </div>
              
              {isLoading ? (
                <div className="py-4 text-center">
                  <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando vídeos...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {/* Main video as first item if it exists */}
                  {mainVideo && (
                    <div 
                      onClick={() => {
                        setCurrentVideo(mainVideo);
                        setCurrentDescription(mainVideoDescription);
                        setSelectedVideoIndex(null);
                      }}
                      className={`flex items-start space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedVideoIndex === null && currentVideo === mainVideo
                          ? 'border-l-4' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      style={selectedVideoIndex === null && currentVideo === mainVideo ? 
                        { 
                          borderLeftColor: companyColor,
                          backgroundColor: `${companyColor}10` // 10% opacity
                        } : {}}
                    >
                      <div className="relative flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-gray-200">
                        <Video className="h-5 w-5 absolute inset-0 m-auto text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Vídeo Institucional</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {mainVideoDescription || "Vídeo de apresentação da empresa"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Company videos from database */}
                  {videos.map((video, index) => (
                    <div 
                      key={video.id}
                      onClick={() => handleSelectVideo(video, index)}
                      className={`flex items-start space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedVideoIndex === index 
                          ? 'border-l-4' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      style={selectedVideoIndex === index ? 
                        { 
                          borderLeftColor: companyColor,
                          backgroundColor: `${companyColor}10` // 10% opacity
                        } : {}}
                    >
                      <div className="relative flex-shrink-0 w-20 h-12 rounded overflow-hidden">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Video className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        {video.duration && (
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                            {video.duration}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{video.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {video.description || ""}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {videos.length === 0 && !mainVideo && (
                    <div className="py-6 text-center">
                      <p className="text-gray-500">Nenhum vídeo disponível.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
