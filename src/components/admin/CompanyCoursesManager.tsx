
import React from 'react';
import { Loader2 } from "lucide-react";
import { Course } from './courses/types';
import { CompanyList } from './courses/manager/CompanyList';
import { CompanyManagerActions } from './courses/manager/CompanyManagerActions';
import { useCourseCompanies } from './courses/manager/useCourseCompanies';

interface CompanyCoursesManagerProps {
  course: Course;
  onClose: () => void;
}

export const CompanyCoursesManager: React.FC<CompanyCoursesManagerProps> = ({ 
  course, 
  onClose 
}) => {
  const {
    companies,
    selectedCompanies,
    isLoading,
    isSaving,
    handleToggleCompany,
    handleSave
  } = useCourseCompanies(course);

  const onSaveAndClose = async () => {
    const success = await handleSave();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground mb-4">
            Selecione as empresas que devem ter acesso a este curso:
          </div>

          <CompanyList
            companies={companies}
            selectedCompanies={selectedCompanies}
            onToggleCompany={handleToggleCompany}
          />

          <CompanyManagerActions
            onClose={onClose}
            onSave={onSaveAndClose}
            isSaving={isSaving}
          />
        </>
      )}
    </div>
  );
};
