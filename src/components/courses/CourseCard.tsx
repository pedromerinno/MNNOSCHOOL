
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Course } from './CourseList';
import { CourseCardTags } from './card/CourseCardTags';
import { CourseCardImage } from './card/CourseCardImage';
import { CourseCardInstructor } from './card/CourseCardInstructor';
import { CourseCardProgress } from './card/CourseCardProgress';
import { useCourseCardFavorite } from './card/useCourseCardFavorite';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { 
    id, 
    title, 
    description, 
    image_url, 
    instructor, 
    progress = 0, 
    completed = false, 
    tags = [], 
    favorite = false 
  } = course;
  
  const { isFavorite, isSubmitting, handleToggleFavorite } = useCourseCardFavorite(id, favorite);

  return (
    <Card className="group h-full overflow-hidden rounded-[20px] border border-gray-200 dark:border-gray-700">
      <Link to={`/courses/${id}`} className="block h-full">
        <div className="flex flex-col h-full">
          {/* Hero Image with reduced height */}
          <CourseCardImage 
            imageUrl={image_url}
            isFavorite={isFavorite}
            isSubmitting={isSubmitting}
            progress={progress}
            completed={completed}
            onToggleFavorite={handleToggleFavorite}
          />
          
          {/* Content - better organized */}
          <div className="p-5 space-y-3 flex-grow flex flex-col">
            {/* Tags - moved to top for better organization */}
            <CourseCardTags tags={tags} />
            
            {/* Title - made slightly more prominent */}
            <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
            
            {/* Description - with slightly better formatting */}
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {description}
              </p>
            )}
            
            {/* Push metadata to bottom with flex-grow */}
            <div className="flex-grow"></div>
            
            {/* Metadata & Actions Row - better arranged */}
            <div className="flex items-center justify-between pt-2 mt-3 border-t border-gray-100 dark:border-gray-800">
              <CourseCardInstructor instructor={instructor} />
              <CourseCardProgress completed={completed} progress={progress} />
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};
