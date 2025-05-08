
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { CourseList } from '../courses/CourseList';
import { useCourses } from '../courses/useCourses';
import { Company } from '@/types/company';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LinkCoursesDialog } from './courses/LinkCoursesDialog';

interface CompanyCourseManagementProps {
  company: Company;
}

export const CompanyCourseManagement: React.FC<CompanyCourseManagementProps> = ({ 
  company 
}) => {
  const [currentCompanyId, setCurrentCompanyId] = useState<string>(company.id);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  
  // Update company ID when the company prop changes
  useEffect(() => {
    if (company.id !== currentCompanyId) {
      console.log(`CompanyCourseManagement: Company changed from ${currentCompanyId} to ${company.id}`);
      setCurrentCompanyId(company.id);
    }
  }, [company.id, currentCompanyId]);
  
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
    handleFormSubmit,
    fetchCourses
  } = useCourses(currentCompanyId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Cursos da Empresa</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os cursos disponíveis para {company.nome}
          </p>
        </div>
        
        <Button 
          onClick={() => setIsLinkDialogOpen(true)} 
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Vincular Curso
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
            showAllCourses={false}
            companyId={currentCompanyId}
            handleFormSubmit={handleFormSubmit}
          />
        </CardContent>
      </Card>

      <LinkCoursesDialog 
        open={isLinkDialogOpen} 
        onOpenChange={setIsLinkDialogOpen}
        companyId={currentCompanyId} 
        companyName={company.nome}
        onCoursesLinked={() => {
          fetchCourses();
        }}
      />
    </div>
  );
};
