
import React from 'react';
import { Book } from "lucide-react";
import { CourseFilterMenu } from './CourseFilterMenu';

type FilterOption = 'all' | 'newest' | 'popular';

interface CourseCatalogHeaderProps {
  setActiveFilter: (filter: FilterOption) => void;
}

export const CourseCatalogHeader: React.FC<CourseCatalogHeaderProps> = ({ setActiveFilter }) => {
  return (
    <div className="flex justify-between items-center mt-8">
      <div className="flex items-center space-x-2">
        <Book className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-medium">Catálogo de Cursos</h2>
      </div>
      
      <CourseFilterMenu setActiveFilter={setActiveFilter} />
    </div>
  );
};
