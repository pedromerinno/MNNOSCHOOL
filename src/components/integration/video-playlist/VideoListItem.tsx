
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
      className={`flex items-start space-x-3 p-3 rounded-md cursor-pointer transition-all ${
        isSelected
          ? 'border-l-4 shadow-sm' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
      }`}
      style={isSelected ? 
        { 
          borderLeftColor: companyColor,
          backgroundColor: `${companyColor}10` // 10% opacity
        } : {}}
    >
      <div className="relative flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="h-5 w-5 text-gray-500" />
          </div>
        )}
        {duration && (
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded text-[10px]">
            {duration}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};
