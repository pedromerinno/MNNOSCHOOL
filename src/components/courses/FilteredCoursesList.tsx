
import React from 'react';
import { Course, FilterOption } from '@/hooks/my-courses';
import { CourseCard } from './CourseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Course as CourseListCourse } from './CourseList';

interface FilteredCoursesListProps {
  courses: Course[];
  loading: boolean;
  activeFilter: FilterOption;
  companyColor: string;
}

export const FilteredCoursesList = ({ 
  courses, 
  loading, 
  activeFilter,
  companyColor 
}: FilteredCoursesListProps) => {
  // Get filter title based on active filter
  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'favorites':
        return 'Cursos Favoritos';
      case 'in-progress':
        return 'Cursos Em Progresso';
      case 'completed':
        return 'Cursos Concluídos';
      case 'all':
      default:
        return 'Todos os Cursos';
    }
  };
  
  // Convert to CourseList.Course type by ensuring required properties are present
  const convertToCourseListType = (course: Course): CourseListCourse => {
    return {
      id: course.id,
      title: course.title,
      description: course.description || '',
      image_url: course.image_url || '/placeholder.svg',
      instructor: course.instructor || '',
      tags: course.tags || [],
      progress: course.progress,
      completed: course.completed,
      favorite: course.favorite,
      last_accessed: course.last_accessed
    };
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-6" style={{ color: companyColor }}>
        {getFilterTitle()}
      </h2>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[260px] w-full rounded-lg" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(course => (
            <CourseCard key={course.id} course={convertToCourseListType(course)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg border-gray-200 dark:border-gray-700 text-center">
          <AlertCircle className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Nenhum curso encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {activeFilter === 'all' 
              ? 'Não foram encontrados cursos para sua empresa.'
              : activeFilter === 'favorites'
              ? 'Você não tem cursos marcados como favoritos ainda.'
              : activeFilter === 'in-progress'
              ? 'Você não começou nenhum curso ainda.'
              : 'Você não completou nenhum curso ainda.'}
          </p>
        </div>
      )}
    </div>
  );
};
