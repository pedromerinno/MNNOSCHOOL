
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CourseTable } from '../CourseTable';
import { CourseForm } from '../CourseForm';
import { CompanyCoursesManager } from '../CompanyCoursesManager';
import { useCourses } from './useCourses';
import { Course } from './types';
import { LessonManager } from './LessonManager';

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  selectedCourse: Course | undefined;
  setSelectedCourse: (course: Course | undefined) => void;
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  isCompanyManagerOpen: boolean;
  setIsCompanyManagerOpen: (isOpen: boolean) => void;
  isSubmitting: boolean;
}

export const CourseList: React.FC<CourseListProps> = ({ 
  courses, 
  isLoading, 
  selectedCourse, 
  setSelectedCourse,
  isFormOpen, 
  setIsFormOpen,
  isCompanyManagerOpen, 
  setIsCompanyManagerOpen,
  isSubmitting
}) => {
  const { handleDeleteCourse, handleFormSubmit } = useCourses();
  const [isLessonsDialogOpen, setIsLessonsDialogOpen] = React.useState(false);

  const handleCreateCourse = () => {
    setSelectedCourse(undefined);
    setIsFormOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const handleManageCompanies = (course: Course) => {
    setSelectedCourse(course);
    setIsCompanyManagerOpen(true);
  };
  
  const handleViewLessons = (course: Course) => {
    setSelectedCourse(course);
    setIsLessonsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de Cursos</h2>
        <Button onClick={handleCreateCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </div>
      
      <CourseTable 
        courses={courses} 
        loading={isLoading} 
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
        onManageCompanies={handleManageCompanies}
        onViewLessons={handleViewLessons}
      />

      {/* Course Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? 'Editar Curso' : 'Criar Novo Curso'}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse 
                ? 'Atualize os detalhes do curso abaixo.' 
                : 'Preencha o formulário para criar um novo curso.'}
            </DialogDescription>
          </DialogHeader>
          <CourseForm 
            initialData={selectedCourse}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Company Courses Manager Dialog */}
      <Dialog open={isCompanyManagerOpen} onOpenChange={setIsCompanyManagerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Gerenciar Empresas para {selectedCourse?.title}
            </DialogTitle>
            <DialogDescription>
              Adicione ou remova empresas que têm acesso a este curso.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <CompanyCoursesManager 
              course={selectedCourse}
              onClose={() => setIsCompanyManagerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Lessons Manager Dialog */}
      {selectedCourse && (
        <LessonManager
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          onClose={() => setIsLessonsDialogOpen(false)}
          open={isLessonsDialogOpen}
        />
      )}
    </div>
  );
};
