
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Info, List, Video } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Inicializar com o vídeo principal ou com o primeiro vídeo da playlist
  const initialVideo = mainVideo || (videos.length > 0 ? videos[0].video_url : '');
  const initialDescription = mainVideoDescription || (videos.length > 0 ? videos[0].description || '' : '');
  
  const [currentVideo, setCurrentVideo] = useState(initialVideo);
  const [currentDescription, setCurrentDescription] = useState(initialDescription);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

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

  // Formatamos o URL do vídeo para garantir que ele funcione como um embed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Se já for um URL de embed, retorna como está
    if (url.includes('embed')) return url;
    
    // YouTube: converte o URL padrão para o formato de embed
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // YouTube: converte o URL curto para o formato de embed
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo: converte o URL padrão para o formato de embed
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(currentVideo);

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
            <div className="aspect-video bg-gray-100 dark:bg-gray-800">
              {embedUrl ? (
                <iframe 
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Vídeo de integração"
                />
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
