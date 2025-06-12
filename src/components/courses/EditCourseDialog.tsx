
import React, { useEffect } from 'react';
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

  // Debugging log
  useEffect(() => {
    if (open) {
      console.log('Edit dialog opened with company IDs:', initialData.companyIds);
    }
  }, [open, initialData.companyIds]);

  // Prevent scrolling with improved handling
  useEffect(() => {
    // Apply immediately when dialog opens to prevent any flickering
    if (open) {
      // Apply these styles synchronously to prevent any visual jumps
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    }
    
    return () => {
      // Only reset when dialog actually closes
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    
    // When dialog closes, trigger refresh event
    if (!newOpen) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('course-updated', {
          detail: { courseId: initialData.id }
        }));
      }, 100);
    }
  };

  const handleDeleteCourse = async () => {
    // Make sure we have a valid ID before trying to delete
    if (!initialData.id) {
      toast.error('Erro ao excluir curso: ID não encontrado');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        const success = await deleteCourse(initialData.id);
        if (success) {
          onOpenChange(false);
          navigate('/courses');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Erro ao excluir curso');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
        </DialogHeader>
        <CourseForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={() => handleOpenChange(false)}
          isSubmitting={isSubmitting}
          onClose={() => handleOpenChange(false)}
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
