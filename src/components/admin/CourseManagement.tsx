
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { CourseList } from './courses/CourseList';
import { useCourses } from './courses/useCourses';
import { Course } from './courses/types';
import { NewCourseDialog } from './dialogs/NewCourseDialog';
import { AdminPageTitle } from './AdminPageTitle';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/company/useIsAdmin';

export type { Course };

export const CourseManagement: React.FC = () => {
  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = useState(false);
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const { isAdmin } = useIsAdmin();
  
  // Sempre usar empresa selecionada, mesmo para super admin
  const companyId = selectedCompany?.id;
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
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
  } = useCourses(companyId);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Todos os Cursos"
        description={selectedCompany 
          ? `Gerenciar ${courses.length} ${courses.length === 1 ? 'curso' : 'cursos'} de ${selectedCompany.nome}` 
          : `Gerenciar ${courses.length} ${courses.length === 1 ? 'curso' : 'cursos'}`}
        size="xl"
        actions={
          isAdmin ? (
            <Button
              onClick={() => setIsNewCourseDialogOpen(true)}
              className="bg-black hover:bg-gray-800 text-white rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Curso
            </Button>
          ) : null
        }
      />
      
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
        companyId={companyId}
        handleFormSubmit={handleFormSubmit}
        companyColor={companyColor}
      />

      <NewCourseDialog 
        open={isNewCourseDialogOpen} 
        onOpenChange={setIsNewCourseDialogOpen} 
      />
    </div>
  );
};
