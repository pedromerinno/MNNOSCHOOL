
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Video, Play, PlayCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from '@/utils/durationUtils';

interface VideoListItemProps {
  isMainVideo: boolean;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  duration: string | null;
  isSelected: boolean;
  onClick: () => void;
  companyColor: string;
  index: number;
}

export const VideoListItem: React.FC<VideoListItemProps> = ({
  isMainVideo,
  title,
  description,
  thumbnailUrl,
  duration,
  isSelected,
  onClick,
  companyColor,
  index
}) => {
  return (
    <div
      className={cn(
        "relative transition-all duration-200 cursor-pointer group rounded-xl overflow-hidden",
        isSelected
          ? "scale-[1.02]"
          : ""
      )}
      style={{
        backgroundColor: isSelected ? `${companyColor}08` : "transparent",
      }}
      onClick={onClick}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Thumbnail with number */}
          <div className="flex-shrink-0 relative">
            <div 
              className={cn(
                "relative w-24 h-14 rounded-lg overflow-hidden transition-all",
                isSelected 
                  ? ""
                  : "border border-gray-200/30 dark:border-gray-700/30 group-hover:border-gray-200/50 dark:group-hover:border-gray-700/50"
              )}
              style={{
                borderColor: isSelected ? `${companyColor}20` : undefined,
              }}
            >
              {thumbnailUrl ? (
                <img 
                  src={thumbnailUrl} 
                  alt={title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundColor: isSelected ? `${companyColor}10` : undefined,
                  }}
                >
                  <PlayCircle 
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isSelected ? "" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )}
                    style={isSelected ? { color: companyColor } : undefined}
                  />
                </div>
              )}
              
              {/* Video number badge */}
              <div 
                className={cn(
                  "absolute top-1.5 left-1.5 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
                  isSelected ? "opacity-100" : "opacity-90"
                )}
                style={{
                  backgroundColor: isSelected ? companyColor : "rgba(0, 0, 0, 0.7)",
                }}
              >
                {index + 1}
              </div>
              
              {/* Duration badge */}
              {duration && formatDuration(duration) && (
                <div 
                  className={cn(
                    "absolute bottom-1.5 right-1.5 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow-sm",
                    isSelected ? "opacity-100" : "opacity-90"
                  )}
                  style={{
                    backgroundColor: isSelected ? companyColor : "rgba(0, 0, 0, 0.8)",
                  }}
                >
                  {formatDuration(duration)}
                </div>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 
              className={cn(
                "font-semibold text-sm leading-tight mb-1 line-clamp-2 transition-colors",
                isSelected ? "" : "text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200"
              )}
              style={{
                color: isSelected ? companyColor : undefined
              }}
            >
              {title}
            </h4>
            
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                {description}
              </p>
            )}
            
            {/* Play indicator */}
            <div className="flex items-center gap-2">
              <div 
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                  isSelected 
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 bg-gray-100 dark:bg-gray-800"
                )}
                style={isSelected ? {
                  backgroundColor: `${companyColor}15`,
                } : undefined}
              >
                <Play 
                  className={cn(
                    "w-3 h-3 transition-colors",
                    isSelected ? "fill-current" : "text-gray-600 dark:text-gray-400"
                  )}
                  style={isSelected ? { color: companyColor } : undefined}
                />
              </div>
              {isSelected && (
                <span 
                  className="text-[10px] font-medium uppercase tracking-wide"
                  style={{ color: companyColor }}
                >
                  Reproduzindo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
