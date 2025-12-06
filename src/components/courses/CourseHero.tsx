
import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseHeroProps {
  imageUrl: string | null;
  title: string;
  instructor: string;
  favorite: boolean;
  courseId: string;
  firstLessonId?: string;
  showEditButton?: boolean;
  onEditCourse?: () => void;
}

export const CourseHero: React.FC<CourseHeroProps> = React.memo(({ 
  imageUrl, 
  title,
  instructor,
  favorite,
  courseId,
  firstLessonId,
  showEditButton = false,
  onEditCourse
}) => {
  const navigate = useNavigate();

  // Default image to use when course image is null or empty
  const defaultImage = "/placeholder.svg";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = defaultImage;
  };

  const imageSrc = useMemo(() => {
    if (!imageUrl || imageUrl.trim() === '') {
      return defaultImage;
    }
    return imageUrl;
  }, [imageUrl]);

  const handleStartLearning = () => {
    if (firstLessonId) {
      navigate(`/courses/${courseId}/lessons/${firstLessonId}`);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8">
      <div className="relative aspect-[16/7] w-full min-h-[300px] md:min-h-[400px] lg:min-h-[450px]">
        {showEditButton && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="secondary"
              className="flex gap-2 bg-white/95 dark:bg-card/95 backdrop-blur-sm text-foreground border-none hover:bg-white dark:hover:bg-card shadow-md"
              onClick={onEditCourse}
              size="sm"
              aria-label="Editar curso"
            >
              <Pencil className="h-4 w-4" />
              Editar curso
            </Button>
          </div>
        )}
        
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-10 xl:p-12 text-white z-10">
          <div className="flex flex-col gap-4 md:gap-5 max-w-2xl lg:max-w-3xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white">
              {title}
            </h2>
          </div>

          <div className="flex items-end justify-between flex-wrap gap-4 mt-auto">
            {instructor && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                  <span className="text-white text-sm md:text-base font-semibold">
                    {instructor.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <span className="text-white font-medium text-sm md:text-base lg:text-lg">
                  {instructor}
                </span>
              </div>
            )}

            <Button
              onClick={handleStartLearning}
              className="bg-white hover:bg-white/90 text-black rounded-full px-5 py-4 md:px-6 md:py-5 h-auto font-semibold text-sm md:text-base flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <span>Começar a Aprender</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
