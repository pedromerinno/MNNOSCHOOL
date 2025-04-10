
import React from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { CourseList } from './courses/CourseList';
import { useCourses } from './courses/useCourses';
import { Course } from './courses/types';

export type { Course };

export const CourseManagement: React.FC = () => {
  const { 
    courses, 
    isLoading, 
    selectedCourse, 
    setSelectedCourse,
    isFormOpen, 
    setIsFormOpen,
    isCompanyManagerOpen, 
    setIsCompanyManagerOpen, 
    isSubmitting,
    handleFormSubmit
  } = useCourses();

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Gerenciamento de Cursos</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Administre todos os cursos da plataforma
        </p>
      </div>
      
      <Card>
        <CardContent>
          <CourseList 
            courses={courses}
            isLoading={isLoading}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
            isCompanyManagerOpen={isCompanyManagerOpen}
            setIsCompanyManagerOpen={setIsCompanyManagerOpen}
            isSubmitting={isSubmitting}
            showAllCourses={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};
