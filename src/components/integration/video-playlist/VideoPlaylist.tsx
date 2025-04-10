
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Info, List, Video } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from './VideoPlayer';
import { VideoList } from './VideoList';
import { NoVideosAvailable } from './NoVideosAvailable';
import { CompanyVideo } from './types';

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

  // If no videos are available and no main video, display a message
  if (!mainVideo && videos.length === 0 && !isLoading) {
    return <NoVideosAvailable />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <VideoPlayer 
              videoUrl={currentVideo} 
              description={currentDescription} 
            />
          </Card>
        </div>
        
        <div>
          <VideoList 
            videos={videos}
            mainVideo={mainVideo}
            mainVideoDescription={mainVideoDescription}
            isLoading={isLoading}
            selectedVideoIndex={selectedVideoIndex}
            onSelectVideo={handleSelectVideo}
            onSelectMainVideo={() => {
              setCurrentVideo(mainVideo);
              setCurrentDescription(mainVideoDescription);
              setSelectedVideoIndex(null);
            }}
            companyColor={selectedCompany?.cor_principal || "#1EAEDB"}
            currentVideo={currentVideo}
          />
        </div>
      </div>
    </div>
  );
};
