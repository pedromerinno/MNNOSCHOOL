
import React, { useEffect, useMemo, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { courseSchema, CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from 'sonner';
import { createCourse } from '@/services/course';
import { useNavigate } from 'react-router-dom';
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { CourseFormFields } from '@/components/admin/courses/form/CourseFormFields';
import { TagsField } from '@/components/admin/courses/form/TagsField';
import { CourseAccessControlField } from '@/components/admin/courses/form/CourseAccessControlField';

interface NewCourseDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const NewCourseDialog: React.FC<NewCourseDialogProps> = ({ open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedCompany } = useCompanies();
  const navigate = useNavigate();

  // Initialize companyIds with preselectedCompanyId
  const initialCompanyIds = selectedCompany?.id ? [selectedCompany.id] : [];

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      instructor: "",
      tags: [],
      companyIds: initialCompanyIds,
      accessType: 'public',
      jobRoleIds: [],
      userIds: [],
    },
  });

  // Watch for company changes - memoize to prevent unnecessary re-renders
  const watchedCompanyIds = form.watch("companyIds");
  const companyIdsKey = useMemo(() => {
    const ids = watchedCompanyIds || [];
    return JSON.stringify(ids.sort());
  }, [watchedCompanyIds]);
  
  const memoizedCompanyIds = useMemo(() => {
    return watchedCompanyIds || [];
  }, [companyIdsKey]);

  // Ensure preselected company is set
  useEffect(() => {
    if (selectedCompany?.id) {
      const currentCompanyIds = form.getValues("companyIds") || [];
      if (!currentCompanyIds.includes(selectedCompany.id)) {
        form.setValue("companyIds", [selectedCompany.id]);
      }
    }
  }, [selectedCompany?.id, form]);

  // Reset access control when companies change
  useEffect(() => {
    if (companyIdsKey) {
      form.setValue("accessType", 'public');
      form.setValue("jobRoleIds", []);
      form.setValue("userIds", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyIdsKey]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        description: "",
        image_url: "",
        instructor: "",
        tags: [],
        companyIds: initialCompanyIds,
        accessType: 'public',
        jobRoleIds: [],
        userIds: [],
      });
    }
  }, [open, form, initialCompanyIds]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const handleFormSubmit = async () => {
    // Ensure selected company is always included
    if (selectedCompany?.id) {
      const currentCompanyIds = form.getValues("companyIds") || [];
      if (!currentCompanyIds.includes(selectedCompany.id)) {
        form.setValue("companyIds", [selectedCompany.id]);
      }
    }

    const isValid = await form.trigger();
    if (isValid) {
      setIsSubmitting(true);
      try {
        const formData = form.getValues();
        // Ensure companyIds always includes the selected company
        const finalCompanyIds = selectedCompany?.id 
          ? [selectedCompany.id] 
          : formData.companyIds || [];
        
        console.log('Creating course with data:', {
          ...formData,
          companyIds: finalCompanyIds
        });
        
        const courseId = await createCourse({
          ...formData,
          companyIds: finalCompanyIds
        });
        
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
            <CourseAccessControlField 
              form={form} 
              companyIds={memoizedCompanyIds}
            />
          </div>
        )
      }
    ];
  }, [form, memoizedCompanyIds]);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <Form {...form}>
      <HorizontalSettingsDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Novo Curso"
        sections={sections}
        defaultSectionId="general"
        onCancel={() => handleOpenChange(false)}
        onSave={handleFormSubmit}
        saveLabel="Criar Curso"
        cancelLabel="Cancelar"
        isSaving={isSubmitting}
        isFormValid={isFormValid()}
        saveButtonStyle={isFormValid() ? { 
          backgroundColor: companyColor,
          borderColor: companyColor
        } : undefined}
      />
    </Form>
  );
};
