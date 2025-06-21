
import React from 'react';
import { FeaturedCourse } from './FeaturedCourse';
import { Skeleton } from "@/components/ui/skeleton";

interface CourseCarouselProps {
  courses: any[];
  loading: boolean;
}

export const CourseCarousel: React.FC<CourseCarouselProps> = ({ courses, loading }) => {
  console.log('📸 CourseCarousel rendered with:', { 
    coursesCount: courses?.length || 0, 
    loading,
    firstCourse: courses?.[0]?.title 
  });

  if (loading) {
    return (
      <div className="w-full px-4 py-6">
        <div className="w-full h-64">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    console.log('📸 CourseCarousel: No courses to display');
    return null;
  }

  // Pegar o primeiro curso para exibir como featured
  const featuredCourse = courses[0];
  console.log('📸 CourseCarousel: Using featured course:', featuredCourse?.title);

  return (
    <div className="w-full px-4">
      <FeaturedCourse course={featuredCourse} />
    </div>
  );
};
