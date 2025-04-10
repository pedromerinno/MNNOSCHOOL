
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CourseCardImageProps {
  imageUrl: string | null;
  isFavorite: boolean;
  isSubmitting: boolean;
  progress: number;
  completed: boolean;
  onToggleFavorite: (e: React.MouseEvent) => Promise<void>;
}

export const CourseCardImage: React.FC<CourseCardImageProps> = ({ 
  imageUrl, 
  isFavorite, 
  isSubmitting, 
  progress, 
  completed,
  onToggleFavorite
}) => {
  return (
    <div className="relative">
      <div className="aspect-[16/6] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Course thumbnail" 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
        )}
      </div>
      
      {/* Like button */}
      <Button 
        size="icon" 
        variant="ghost" 
        className={cn(
          "absolute top-2 right-2 rounded-full h-8 w-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm transition-colors",
          isFavorite 
            ? "hover:bg-red-100 dark:hover:bg-red-950/30" 
            : "hover:bg-white dark:hover:bg-gray-800"
        )}
        onClick={onToggleFavorite}
        disabled={isSubmitting}
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-colors", 
            isFavorite 
              ? "fill-red-500 text-red-500" 
              : "text-gray-600 dark:text-gray-400"
          )} 
        />
      </Button>
      
      {/* Progress Bar */}
      {progress > 0 && !completed && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-blue-500 dark:bg-blue-600" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
