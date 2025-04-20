
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Info, List, Video } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from './VideoPlayer';
import { VideoList } from './VideoList';
import { NoVideosAvailable } from './NoVideosAvailable';
import { CompanyVideo } from './types';
import { toast } from "sonner";

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
  
  // If companyId is not provided, use selectedCompany?.id
  const activeCompanyId = companyId || selectedCompany?.id;

  // Forced refetch function
  const fetchVideos = useCallback(async () => {
    if (!activeCompanyId) {
      setVideos([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    console.log(`VideoPlaylist: Loading videos for company ID: ${activeCompanyId}`);
    
    try {
      const { data, error } = await supabase
        .from('company_videos')
        .select('*')
        .eq('company_id', activeCompanyId)
        .order('order_index');
        
      if (error) throw error;
      
      console.log(`VideoPlaylist: Loaded ${data?.length || 0} videos for company ${activeCompanyId}`);
      setVideos(data || []);
      
      // Determine which video to show first
      if (mainVideo) {
        setCurrentVideo(mainVideo);
        setCurrentDescription(mainVideoDescription || '');
        setSelectedVideoIndex(null);  // null means main video is selected
      } else if (data && data.length > 0) {
        setCurrentVideo(data[0].video_url);
        setCurrentDescription(data[0].description || '');
        setSelectedVideoIndex(0);
      } else {
        setCurrentVideo('');
        setCurrentDescription('');
        setSelectedVideoIndex(null);
      }
    } catch (error) {
      console.error("Error fetching company videos:", error);
      setVideos([]);
      toast.error("Erro ao carregar vídeos", {
        description: "Tente selecionar a empresa novamente"
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeCompanyId, mainVideo, mainVideoDescription]);
  
  // Clear videos when company is changing
  useEffect(() => {
    const handleCompanyChanging = () => {
      console.log("VideoPlaylist: Company is changing, cleaning up videos");
      setVideos([]);
      setCurrentVideo('');
      setCurrentDescription('');
      setSelectedVideoIndex(null);
    };
    
    window.addEventListener('company-changing', handleCompanyChanging);
    return () => {
      window.removeEventListener('company-changing', handleCompanyChanging);
    };
  }, []);
  
  // Load videos when company changes
  useEffect(() => {
    if (activeCompanyId) {
      console.log(`VideoPlaylist: Company ID changed to ${activeCompanyId}, loading videos`);
      fetchVideos();
    } else {
      console.log("VideoPlaylist: No active company ID, clearing videos");
      setVideos([]);
      setCurrentVideo('');
      setCurrentDescription('');
    }
  }, [activeCompanyId, fetchVideos]);

  // Listen for company selection and specific reload events
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const company = event.detail?.company;
      if (company) {
        console.log(`VideoPlaylist: Company selection changed to ${company.nome}, reloading videos`);
        // Delay to ensure state is updated
        setTimeout(() => {
          if (company.id === activeCompanyId) {
            fetchVideos();
          }
        }, 300);
      }
    };
    
    // Listen for specific video reload event
    const handleReloadVideos = (event: CustomEvent) => {
      const eventCompanyId = event.detail?.companyId;
      console.log(`VideoPlaylist: Reload videos event received for company: ${eventCompanyId}`);
      
      if (eventCompanyId && eventCompanyId === activeCompanyId) {
        console.log("VideoPlaylist: Reloading videos for current company");
        setTimeout(fetchVideos, 300);
      }
    };
    
    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    window.addEventListener('reload-company-videos', handleReloadVideos as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
      window.removeEventListener('reload-company-videos', handleReloadVideos as EventListener);
    };
  }, [activeCompanyId, fetchVideos]);

  const handleSelectVideo = (video: CompanyVideo, index: number) => {
    setCurrentVideo(video.video_url);
    setCurrentDescription(video.description || '');
    setSelectedVideoIndex(index);
  };
  
  const handleSelectMainVideo = () => {
    if (mainVideo) {
      setCurrentVideo(mainVideo);
      setCurrentDescription(mainVideoDescription || '');
      setSelectedVideoIndex(null);
    }
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
            mainVideo={mainVideo} 
            mainVideoDescription={mainVideoDescription}
            isLoading={isLoading}
            selectedVideoIndex={selectedVideoIndex}
            onSelectVideo={handleSelectVideo}
            onSelectMainVideo={handleSelectMainVideo}
            companyColor={selectedCompany?.cor_principal || "#1EAEDB"}
            currentVideo={currentVideo}
          />
        </div>
      </div>
    </div>
  );
};
