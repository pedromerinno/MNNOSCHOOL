
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from '@/components/admin/CourseForm';
import { CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { Company } from '@/types/company';

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: CourseFormValues;
  onSubmit: (data: CourseFormValues) => Promise<void>;
  isSubmitting: boolean;
  userCompanies: Company[];
}

export const EditCourseDialog: React.FC<EditCourseDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
  userCompanies
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
        </DialogHeader>
        <CourseForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          onClose={() => onOpenChange(false)}
          availableCompanies={userCompanies}
          showCompanySelector={true}
        />
      </DialogContent>
    </Dialog>
  );
};
