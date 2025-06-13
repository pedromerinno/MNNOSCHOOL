
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CourseList } from './courses/CourseList';
import { useCourses } from './courses/useCourses';
import { Course } from './courses/types';
import { NewCourseDialog } from './dialogs/NewCourseDialog';

export type { Course };

export const CourseManagement: React.FC = () => {
  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = useState(false);
  
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold py-[10px]">Gerenciamento de Cursos</h2>
        </div>
        <Button
          onClick={() => setIsNewCourseDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Curso
        </Button>
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
            handleFormSubmit={handleFormSubmit} 
          />
        </CardContent>
      </Card>

      <NewCourseDialog 
        open={isNewCourseDialogOpen} 
        onOpenChange={setIsNewCourseDialogOpen} 
      />
    </div>
  );
};
