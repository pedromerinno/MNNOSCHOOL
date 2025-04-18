
import React from 'react';
import { Button } from "@/components/ui/button";
import { Share } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { useNavigate } from 'react-router-dom';

interface CourseHeroProps {
  imageUrl: string | null;
  title: string;
  instructor: string;
  favorite: boolean;
  courseId: string;
  firstLessonId?: string;
}

export const CourseHero: React.FC<CourseHeroProps> = ({ 
  imageUrl, 
  title,
  instructor,
  favorite,
  courseId,
  firstLessonId
}) => {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    if (firstLessonId) {
      navigate(`/courses/${courseId}/lessons/${firstLessonId}`);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden h-[400px] bg-[#1A1F2C] text-white">
      {/* Full-width background image */}
      <div className="absolute inset-0 w-full h-full">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        )}
        {/* Diagonal black shadow gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/70 to-transparent"></div>
      </div>
      
      <div className="relative z-10 h-full">
        <div className="flex flex-col h-full p-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            {instructor && (
              <p className="text-white/80 mb-6">
                Por {instructor}
              </p>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              className="bg-white hover:bg-white/90 text-black"
              onClick={handleStartLearning}
            >
              Começar a Aprender
            </Button>
            
            <div className="flex gap-3">
              <FavoriteButton 
                courseId={courseId} 
                initialFavorite={favorite} 
                iconOnly={true}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-0"
              />
              
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-0"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

