
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { createCourse } from "@/services/course";

interface NewCourseDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const NewCourseDialog: React.FC<NewCourseDialogProps> = ({ open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedCompany, userCompanies, user } = useCompanies();
  const navigate = useNavigate();

  // Prevent body scrolling when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleFormSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Creating course with data:', {
        ...data,
        companyIds: data.companyIds || []
      });
      
      const courseId = await createCourse(data);
      
      if (courseId) {
        console.log(`Course ${courseId} created successfully. Notifications should be triggered.`);
        toast.success("Curso criado com sucesso.");
        
        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
          // Close dialog after successful course creation
          onOpenChange(false);
          
          // Navigation occurs after successful course creation
          navigate(`/courses/${courseId}`);
        });
      } else {
        toast.error("Erro ao criar curso. Tente novamente.");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Erro ao criar curso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Curso</DialogTitle>
        </DialogHeader>
        <CourseForm
          onSubmit={handleFormSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          onClose={() => onOpenChange(false)}
          availableCompanies={userCompanies}
          showCompanySelector={true}
          preselectedCompanyId={selectedCompany?.id}
        />
      </DialogContent>
    </Dialog>
  );
};
