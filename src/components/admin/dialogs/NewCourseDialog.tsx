
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";

interface NewCourseDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const NewCourseDialog: React.FC<NewCourseDialogProps> = ({ open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedCompany } = useCompanies();

  const handleFormSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise(res => setTimeout(res, 1200));
      toast.success("Curso criado com sucesso.");
      onOpenChange(false);
    } catch (error) {
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
          preselectedCompanyId={selectedCompany?.id}
        />
      </DialogContent>
    </Dialog>
  );
};
