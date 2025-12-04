
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
    <Card
      className={cn(
        "transition-all duration-150 cursor-pointer group border hover:shadow-sm",
        isSelected
          ? "border-border/60 shadow-sm ring-1"
          : "hover:bg-accent/50 border-border/60"
      )}
      style={{
        backgroundColor: isSelected ? `${companyColor}08` : undefined,
        borderColor: isSelected ? `${companyColor}30` : undefined,
        '--tw-ring-color': isSelected ? `${companyColor}20` : undefined,
      } as React.CSSProperties}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Thumbnail or icon */}
          <div className="flex-shrink-0 relative">
            {isSelected ? (
              <div 
                className="w-20 h-12 rounded-lg flex items-center justify-center border-2 overflow-hidden"
                style={{
                  backgroundColor: `${companyColor}15`,
                  borderColor: `${companyColor}40`
                }}
              >
                {thumbnailUrl ? (
                  <img 
                    src={thumbnailUrl} 
                    alt={title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PlayCircle 
                    className="h-6 w-6" 
                    style={{ color: companyColor }}
                  />
                )}
                {duration && formatDuration(duration) && (
                  <div 
                    className="absolute bottom-1 right-1 text-white text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ backgroundColor: companyColor }}
                  >
                    {formatDuration(duration)}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-muted/60 border-2 border-muted-foreground/20 group-hover:border-primary/30 transition-colors">
                {thumbnailUrl ? (
                  <img 
                    src={thumbnailUrl} 
                    alt={title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                )}
                {duration && formatDuration(duration) && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {formatDuration(duration)}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-semibold text-sm leading-snug mb-1.5 line-clamp-2 transition-colors",
              isSelected 
                ? "" 
                : "text-foreground group-hover:text-primary"
            )}
            style={{
              color: isSelected ? companyColor : undefined
            }}>
              {title}
            </h4>
            
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                {description}
              </p>
            )}
            
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
                isSelected
                  ? ""
                  : "bg-muted/70 text-muted-foreground border-muted-foreground/20"
              )}
              style={{
                backgroundColor: isSelected ? `${companyColor}15` : undefined,
                color: isSelected ? companyColor : undefined,
                borderColor: isSelected ? `${companyColor}20` : undefined
              }}>
                <Video className="w-3 h-3" />
                <span>{isMainVideo ? 'Institucional' : 'Vídeo'}</span>
              </div>
              
              {duration && formatDuration(duration) && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">{formatDuration(duration)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Play button indicator */}
          <div className="flex-shrink-0">
            {isSelected ? (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{
                  backgroundColor: `${companyColor}15`,
                  borderColor: `${companyColor}30`
                }}
              >
                <Play 
                  className="w-4 h-4 fill-current" 
                  style={{ color: companyColor }}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-transparent group-hover:bg-primary/10 border border-transparent group-hover:border-primary/20 flex items-center justify-center transition-all">
                <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
