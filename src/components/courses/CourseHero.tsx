
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CourseHeroProps {
  imageUrl: string | null;
  title: string;
}

export const CourseHero: React.FC<CourseHeroProps> = ({ 
  imageUrl, 
  title 
}) => {
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="aspect-[21/9] w-full overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
        )}
      </div>
      
      {/* Like button */}
      <Button 
        size="icon" 
        variant="ghost" 
        className="absolute top-4 right-4 rounded-full h-10 w-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
      >
        <Heart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </Button>
    </div>
  );
};
