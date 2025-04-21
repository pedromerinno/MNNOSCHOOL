
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from '@/components/admin/CourseForm';
import { CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { Company } from '@/types/company';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteCourse } from '@/services/course';
import { toast } from 'sonner';

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: CourseFormValues;
  onSubmit: (data: CourseFormValues) => Promise<void>;
  isSubmitting: boolean;
  userCompanies: Company[];
  courseId: string;
}

export const EditCourseDialog: React.FC<EditCourseDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
  userCompanies,
  courseId
}) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const success = await deleteCourse(courseId);
      if (success) {
        toast.success('Course deleted successfully');
        onOpenChange(false);
        navigate('/courses');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>Edit Course</DialogTitle>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Course
          </Button>
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
