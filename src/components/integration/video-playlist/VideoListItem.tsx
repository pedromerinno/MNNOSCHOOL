
import React from 'react';
import { Video } from "lucide-react";

interface VideoListItemProps {
  isMainVideo: boolean;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  duration: string | null;
  isSelected: boolean;
  onClick: () => void;
  companyColor: string;
}

export const VideoListItem: React.FC<VideoListItemProps> = ({
  isMainVideo,
  title,
  description,
  thumbnailUrl,
  duration,
  isSelected,
  onClick,
  companyColor
}) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${
        isSelected
          ? 'border-l-4' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={isSelected ? 
        { 
          borderLeftColor: companyColor,
          backgroundColor: `${companyColor}10` // 10% opacity
        } : {}}
    >
      <div className="relative flex-shrink-0 w-16 h-10 rounded overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Video className="h-4 w-4 text-gray-500" />
          </div>
        )}
        {duration && (
          <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-xs px-1 rounded">
            {duration}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
      </div>
    </div>
  );
};
