
import React, { useState } from 'react';
import { Course } from './types';
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Building, Loader2, Users, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CourseForm } from '../CourseForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyCoursesManager } from '../CompanyCoursesManager';
import { LessonManager } from './LessonManager';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  isCompanyManagerOpen: boolean;
  setIsCompanyManagerOpen: (isOpen: boolean) => void;
  isSubmitting: boolean;
  showAllCourses?: boolean;
  companyId?: string;
  handleFormSubmit: (data: any) => Promise<void>;
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
  isSubmitting,
  showAllCourses = false,
  companyId,
  handleFormSubmit
}) => {
  const [isLessonManagerOpen, setIsLessonManagerOpen] = useState(false);
  
  const handleNewCourse = () => {
    setSelectedCourse(null);
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
  
  const handleManageLessons = (course: Course) => {
    setSelectedCourse(course);
    setIsLessonManagerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Carregando cursos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {showAllCourses ? "Todos os Cursos" : "Cursos Disponíveis"}
        </h3>
        <Button onClick={handleNewCourse}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium mb-1">Nenhum curso encontrado</h3>
          <p className="text-gray-500 mb-4">Adicione seu primeiro curso para começar</p>
          <Button onClick={handleNewCourse}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Curso
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Instrutor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.instructor || "Não especificado"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {course.description || "Sem descrição"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManageLessons(course)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Aulas
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManageCompanies(course)}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Empresas
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Formulário de curso */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selectedCourse ? "Editar Curso" : "Novo Curso"}</SheetTitle>
          </SheetHeader>
          <CourseForm 
            initialData={selectedCourse}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
            onClose={() => setIsFormOpen(false)}
            preselectedCompanyId={companyId}
          />
        </SheetContent>
      </Sheet>

      {/* Diálogo para gerenciar empresas */}
      <Dialog open={isCompanyManagerOpen} onOpenChange={setIsCompanyManagerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Empresas</DialogTitle>
          </DialogHeader>
          
          {selectedCourse && (
            <CompanyCoursesManager
              course={selectedCourse}
              onClose={() => setIsCompanyManagerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Gerenciador de aulas */}
      {selectedCourse && (
        <LessonManager
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          onClose={() => setIsLessonManagerOpen(false)}
          open={isLessonManagerOpen}
        />
      )}
    </div>
  );
};
