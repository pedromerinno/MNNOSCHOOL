
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourseData } from '@/hooks/useCourseData';
import { useLessonNavigation } from './useLessonNavigation';
import { CourseHeader } from './CourseHeader';
import { CourseImage } from './CourseImage';
import { CourseDescription } from './CourseDescription';
import { CourseProgress } from './CourseProgress';
import { CourseLessonList } from './CourseLessonList';
import { CourseViewSkeleton } from './CourseViewSkeleton';
import { CourseNotFound } from './CourseNotFound';

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading } = useCourseData(courseId);
  const { startLesson } = useLessonNavigation(courseId);

  if (loading) {
    return <CourseViewSkeleton />;
  }

  if (!course) {
    return <CourseNotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseHeader 
        title={course.title} 
        instructor={course.instructor} 
      />
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <CourseImage 
            imageUrl={course.image_url} 
            title={course.title} 
          />
          
          <CourseDescription description={course.description} />
          
          {course.progress > 0 && (
            <CourseProgress progress={course.progress} />
          )}
        </div>
        
        <div>
          <CourseLessonList 
            lessons={course.lessons} 
            onStartLesson={startLesson} 
          />
        </div>
      </div>
    </div>
  );
};
