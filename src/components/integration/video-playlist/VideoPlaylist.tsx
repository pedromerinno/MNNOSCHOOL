
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
  const [videos, setVideos] = useState<CompanyVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const initialVideo = mainVideo || (videos.length > 0 ? videos[0].video_url : '');
  const initialDescription = mainVideoDescription || (videos.length > 0 ? videos[0].description || '' : '');
  
  const [currentVideo, setCurrentVideo] = useState(initialVideo);
  const [currentDescription, setCurrentDescription] = useState(initialDescription);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

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

  useEffect(() => {
    if (!currentVideo && videos.length > 0) {
      setCurrentVideo(videos[0].video_url);
      setCurrentDescription(videos[0].description || '');
    }
  }, [videos]);

  const handleSelectVideo = (video: CompanyVideo, index: number) => {
    setCurrentVideo(video.video_url);
    setCurrentDescription(video.description || '');
    setSelectedVideoIndex(index);
  };

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
