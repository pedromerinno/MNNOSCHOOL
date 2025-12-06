
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
    <div className="h-full flex flex-col">
      {/* Header with company color accent */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Integração</h3>
          {totalVideos > 0 && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
              {totalVideos}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nenhum vídeo</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Adicione vídeos à playlist</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
