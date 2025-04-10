
import React from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { CourseList } from '../courses/CourseList';
import { useCourses } from '../courses/useCourses';
import { Company } from '@/types/company';

interface CompanyCourseManagementProps {
  company: Company;
}

export const CompanyCourseManagement: React.FC<CompanyCourseManagementProps> = ({ 
  company 
}) => {
  const { 
    courses, 
    isLoading, 
    selectedCourse, 
    setSelectedCourse,
    isFormOpen, 
    setIsFormOpen,
    isCompanyManagerOpen, 
    setIsCompanyManagerOpen, 
    isSubmitting
  } = useCourses(company.id);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Cursos da Empresa</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Gerencie os cursos disponíveis para esta empresa
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
            showAllCourses={false}
            companyId={company.id}
          />
        </CardContent>
      </Card>
    </div>
  );
};
