
import React from 'react';
import { Book } from 'lucide-react';

interface CourseHeroProps {
  imageUrl: string | null;
  title: string;
}

export const CourseHero: React.FC<CourseHeroProps> = ({ 
  imageUrl, 
  title 
}) => {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-border">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-[300px] md:h-[400px] object-cover" 
        />
      ) : (
        <div className="w-full h-[300px] md:h-[400px] flex items-center justify-center bg-muted">
          <Book className="h-20 w-20 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
