
import React from 'react';
import { Button } from "@/components/ui/button";
import { Share } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';

interface CourseHeroProps {
  imageUrl: string | null;
  title: string;
  instructor: string;
  favorite: boolean;
  courseId: string;
}

export const CourseHero: React.FC<CourseHeroProps> = ({ 
  imageUrl, 
  title,
  instructor,
  favorite,
  courseId
}) => {
  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-purple-900 to-purple-700 text-white">
      <div className="absolute inset-0 z-0 opacity-20">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        )}
      </div>
      
      <div className="relative z-10 p-8 md:p-12">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            {instructor && (
              <p className="text-white/80 mb-6">
                By {instructor}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <FavoriteButton 
              courseId={courseId} 
              initialFavorite={favorite} 
              iconOnly={false} 
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            />
            
            <Button variant="outline" size="icon" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button variant="default" className="bg-orange-500 hover:bg-orange-600">
            Start Learning
          </Button>
        </div>
      </div>
    </div>
  );
};
