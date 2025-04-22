
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from '@/components/admin/CourseForm';
import { CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { Company } from '@/types/company';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteCourse } from '@/services/course';
import { toast } from 'sonner';

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
  const navigate = useNavigate();

  const handleDeleteCourse = async () => {
    if (window.confirm('Tem certeza que deseja excluir este curso?')) {
      const success = await deleteCourse(initialData.id as string);
      if (success) {
        onOpenChange(false);
        navigate('/courses');
      }
    }
  };

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
        <div className="mt-6 pt-4 border-t flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDeleteCourse}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir curso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
