
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
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
  const [videos, setVideos] = useState<CompanyVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentVideo, setCurrentVideo] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

  // Memoizar a cor da empresa
  const companyColor = useMemo(() => {
    return selectedCompany?.cor_principal || "#1EAEDB";
  }, [selectedCompany?.cor_principal]);

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
        
        if (data && data.length > 0) {
          setCurrentVideo(data[0].video_url);
          setCurrentDescription(data[0].description || '');
          setSelectedVideoIndex(0);
        } else if (mainVideo) {
          setCurrentVideo(mainVideo);
          setCurrentDescription(mainVideoDescription || '');
          setSelectedVideoIndex(null);
        }
      } catch (error) {
        console.error("Error fetching company videos:", error);
        // Fallback para o vídeo principal se houver erro
        if (mainVideo) {
          setCurrentVideo(mainVideo);
          setCurrentDescription(mainVideoDescription || '');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideos();
  }, [companyId, mainVideo, mainVideoDescription]);

  const handleSelectVideo = (video: CompanyVideo, index: number) => {
    setCurrentVideo(video.video_url);
    setCurrentDescription(video.description || '');
    setSelectedVideoIndex(index);
  };

  if (!currentVideo && videos.length === 0 && !isLoading) {
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
            mainVideo=""
            mainVideoDescription=""
            isLoading={isLoading}
            selectedVideoIndex={selectedVideoIndex}
            onSelectVideo={handleSelectVideo}
            onSelectMainVideo={() => {}}
            companyColor={companyColor}
            currentVideo={currentVideo}
          />
        </div>
      </div>
    </div>
  );
};
