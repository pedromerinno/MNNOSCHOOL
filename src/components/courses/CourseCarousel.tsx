
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedCourse } from './FeaturedCourse';

interface Course {
  id: string;
  title: string;
  description?: string | null;
  instructor?: string;
  image_url?: string;
  tags?: string[];
}

interface CourseCarouselProps {
  courses: Course[];
  loading?: boolean;
}

export const CourseCarousel: React.FC<CourseCarouselProps> = ({ 
  courses, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="w-full h-[350px]">
        <Skeleton className="w-full h-full rounded-xl" />
      </div>
    );
  }
  
  if (!courses || courses.length === 0) {
    return null;
  }
  
  const hasSingleCourse = courses.length === 1;
  
  return (
    <div className={hasSingleCourse ? "max-w-screen-lg mx-auto px-4" : "w-full px-4"}>
      {hasSingleCourse ? (
        <FeaturedCourse course={courses[0]} />
      ) : (
        <div className="w-full">
          {/* For now, just show the first course as featured */}
          <FeaturedCourse course={courses[0]} />
        </div>
      )}
    </div>
  );
};
