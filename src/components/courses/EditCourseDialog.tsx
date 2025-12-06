
import React, { useEffect, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { courseSchema, CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { Company } from '@/types/company';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteCourse } from '@/services/course';
import { toast } from 'sonner';
import { useCompanies } from '@/hooks/useCompanies';
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { CourseFormFields } from '@/components/admin/courses/form/CourseFormFields';
import { TagsField } from '@/components/admin/courses/form/TagsField';
import { JobRolesSelectorField } from '@/components/admin/courses/form/JobRolesSelectorField';

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
  const { selectedCompany } = useCompanies();

  // Initialize companyIds with preselectedCompanyId
  const initialCompanyIds = selectedCompany?.id
    ? [selectedCompany.id]
    : Array.isArray(initialData?.companyIds)
      ? initialData.companyIds
      : initialData?.companyId
        ? [initialData.companyId]
        : [];

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      image_url: initialData?.image_url || "",
      instructor: initialData?.instructor || "",
      tags: initialData?.tags || [],
      companyIds: initialCompanyIds,
      jobRoleIds: initialData?.jobRoleIds || [],
    },
  });

  // Watch for company changes
  const watchedCompanyIds = form.watch("companyIds");

  // Ensure preselected company is set
  useEffect(() => {
    if (selectedCompany?.id) {
      const currentCompanyIds = form.getValues("companyIds") || [];
      if (!currentCompanyIds.includes(selectedCompany.id)) {
        form.setValue("companyIds", [selectedCompany.id]);
      }
    }
  }, [selectedCompany?.id, form]);

  // Reset job roles when companies change
  useEffect(() => {
    form.setValue("jobRoleIds", []);
  }, [watchedCompanyIds, form]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const handleDeleteCourse = async () => {
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

  const handleFormSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const formData = form.getValues();
      await onSubmit(formData);
    }
  };

  const isFormValid = () => {
    const companyIds = form.watch("companyIds") || [];
    return companyIds.length > 0 && form.formState.isValid;
  };

  const sections: SettingsSection[] = useMemo(() => {
    return [
      {
        id: 'general',
        label: 'Geral',
        content: (
          <div className="space-y-6">
            <CourseFormFields form={form} />
          </div>
        )
      },
      {
        id: 'tags',
        label: 'Tags e Categorização',
        content: (
          <div className="space-y-6">
            <TagsField form={form} />
          </div>
        )
      },
      {
        id: 'access',
        label: 'Controle de Acesso',
        content: (
          <div className="space-y-6">
            <JobRolesSelectorField 
              form={form} 
              companyIds={watchedCompanyIds || []}
            />
          </div>
        )
      }
    ];
  }, [form, watchedCompanyIds]);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <Form {...form}>
      <HorizontalSettingsDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Editar Curso"
        sections={sections}
        defaultSectionId="general"
        onCancel={() => handleOpenChange(false)}
        onSave={handleFormSubmit}
        saveLabel="Atualizar Curso"
        cancelLabel="Cancelar"
        isSaving={isSubmitting}
        isFormValid={isFormValid()}
        saveButtonStyle={isFormValid() ? { 
          backgroundColor: companyColor,
          borderColor: companyColor
        } : undefined}
        getCancelButton={(activeSection) => {
          if (activeSection === 'general') {
            return (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive border-red-200 hover:bg-red-50 hover:border-red-300 mr-auto font-normal"
                onClick={handleDeleteCourse}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir curso
              </Button>
            );
          }
          return null;
        }}
      />
    </Form>
  );
};
