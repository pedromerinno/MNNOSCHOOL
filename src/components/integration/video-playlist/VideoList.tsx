
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Clock, Video } from "lucide-react";
import { CompanyVideo } from './types';
import { VideoListItem } from './VideoListItem';
import { LoadingState } from './LoadingState';
import { formatDuration } from '@/utils/durationUtils';

interface VideoListProps {
  videos: CompanyVideo[];
  mainVideo: string;
  mainVideoDescription: string;
  isLoading: boolean;
  selectedVideoIndex: number | null;
  onSelectVideo: (video: CompanyVideo, index: number) => void;
  onSelectMainVideo: () => void;
  companyColor: string;
  currentVideo: string;
}

export const VideoList: React.FC<VideoListProps> = ({
  videos,
  mainVideo,
  mainVideoDescription,
  isLoading,
  selectedVideoIndex,
  onSelectVideo,
  onSelectMainVideo,
  companyColor,
  currentVideo
}) => {
  const totalVideos = videos.length;
  
  return (
    <div className="bg-background rounded-lg p-6 h-fit">
      {/* Header with company color accent */}
      <div className="mb-6 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <PlayCircle 
            className="w-5 h-5" 
            style={{ color: companyColor }}
          />
          <h3 className="text-xl font-bold text-foreground">Playlist de Integração</h3>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: companyColor }}
            ></div>
            <span className="font-medium">{totalVideos} vídeo{totalVideos !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Company videos from database */}
            {videos.map((video, index) => (
              <VideoListItem
                key={video.id}
                isMainVideo={false}
                title={video.title}
                description={video.description || ""}
                thumbnailUrl={video.thumbnail_url}
                duration={video.duration}
                isSelected={selectedVideoIndex === index}
                onClick={() => onSelectVideo(video, index)}
                companyColor={companyColor}
                index={index}
              />
            ))}
            
            {videos.length === 0 && (
              <div className="py-6 text-center">
                <Video className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum vídeo disponível.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
