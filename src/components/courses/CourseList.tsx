
import React from 'react';
import { CourseCard } from './CourseCard';
import { useCourseListData } from './hooks/useCourseListData';
import { PagePreloader } from '@/components/ui/PagePreloader';
import { CourseListEmptyState } from './CourseListEmptyState';
import { CourseFilter } from './types/CourseTypes';

type CourseListProps = {
  title: string;
  filter?: CourseFilter;
};

export const CourseList: React.FC<CourseListProps> = ({ title, filter = 'all' }) => {
  const { courses, loading, hasNoCourses } = useCourseListData(filter);

  if (loading) {
    return <PagePreloader />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <CourseListEmptyState filter={filter} />
      )}
    </div>
  );
};

// Re-export the Course type to maintain backward compatibility
export type { Course } from './types/CourseTypes';
