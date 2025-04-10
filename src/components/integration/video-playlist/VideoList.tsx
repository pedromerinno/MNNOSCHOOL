
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { List, Video } from "lucide-react";
import { CompanyVideo } from './types';
import { VideoListItem } from './VideoListItem';
import { LoadingState } from './LoadingState';

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
  return (
    <Card className="border shadow-sm dark:bg-card/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="flex items-center p-4 border-b dark:border-gray-700" style={{ backgroundColor: `${companyColor}10` }}>
          <List className="h-5 w-5 mr-2" style={{ color: companyColor }} />
          <h3 className="font-medium">Playlist de vídeos</h3>
        </div>
        
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto p-2">
            {/* Main video as first item if it exists */}
            {mainVideo && (
              <VideoListItem
                isMainVideo={true}
                title="Vídeo Institucional"
                description={mainVideoDescription || "Vídeo de apresentação da empresa"}
                isSelected={selectedVideoIndex === null && currentVideo === mainVideo}
                onClick={onSelectMainVideo}
                companyColor={companyColor}
                thumbnailUrl={null}
                duration={null}
              />
            )}
            
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
              />
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
  );
};
