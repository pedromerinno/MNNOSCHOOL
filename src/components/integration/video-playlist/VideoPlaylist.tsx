
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from './VideoPlayer';
import { VideoList } from './VideoList';
import { NoVideosAvailable } from './NoVideosAvailable';
import { CompanyVideo } from './types';
import { HtmlContent } from "@/components/ui/HtmlContent";

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

  // Memoizar o ID da empresa efetivo
  const effectiveCompanyId = useMemo(() => {
    return companyId || selectedCompany?.id;
  }, [companyId, selectedCompany?.id]);

  const fetchVideos = useCallback(async () => {
    if (!effectiveCompanyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_videos')
        .select('*')
        .eq('company_id', effectiveCompanyId)
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
  }, [effectiveCompanyId, mainVideo, mainVideoDescription]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSelectVideo = useCallback((video: CompanyVideo, index: number) => {
    // Evitar troca se já for o vídeo atual
    if (currentVideo === video.video_url && selectedVideoIndex === index) {
      return;
    }
    setCurrentVideo(video.video_url);
    setCurrentDescription(video.description || '');
    setSelectedVideoIndex(index);
  }, [currentVideo, selectedVideoIndex]);

  const handleSelectMainVideo = useCallback(() => {
    if (mainVideo && currentVideo !== mainVideo) {
      setCurrentVideo(mainVideo);
      setCurrentDescription(mainVideoDescription || '');
      setSelectedVideoIndex(null);
    }
  }, [mainVideo, mainVideoDescription, currentVideo]);

  const handleVideoAdded = () => {
    // Recarregar os vídeos quando um novo for adicionado
    fetchVideos();
  };

  if (!currentVideo && videos.length === 0 && !isLoading) {
    if (!effectiveCompanyId) {
      return <NoVideosAvailable 
        companyId="" 
        companyColor={companyColor}
        onVideoAdded={handleVideoAdded}
      />;
    }
    return (
      <NoVideosAvailable 
        companyId={effectiveCompanyId}
        companyColor={companyColor}
        onVideoAdded={handleVideoAdded}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Container 1: Vídeo e Descrição - 2/3 */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden flex flex-col">
        <div className="space-y-6 p-6 lg:p-8 flex-1">
          {/* Video Container */}
          <div className="overflow-hidden rounded-xl">
            <VideoPlayer 
              key={currentVideo}
              videoUrl={currentVideo} 
            />
          </div>
          
          {/* Description Section */}
          {currentDescription && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sobre este vídeo
              </h3>
              <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                <HtmlContent 
                  content={currentDescription} 
                  className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-a:text-primary prose-a:no-underline hover:prose-a:underline" 
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Container 2: Lista da Playlist - 1/3 */}
      <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden flex flex-col">
        <VideoList 
          videos={videos}
          mainVideo={mainVideo}
          mainVideoDescription={mainVideoDescription}
          isLoading={isLoading}
          selectedVideoIndex={selectedVideoIndex}
          onSelectVideo={handleSelectVideo}
          onSelectMainVideo={handleSelectMainVideo}
          companyColor={companyColor}
          currentVideo={currentVideo}
        />
      </div>
    </div>
  );
};
