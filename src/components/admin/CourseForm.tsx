
import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { courseSchema, CourseFormValues, CourseFormProps } from './courses/form/CourseFormTypes';
import { CourseFormFields } from './courses/form/CourseFormFields';
import { TagsField } from './courses/form/TagsField';
import { FormActions } from './courses/form/FormActions';
import { CompanyMultiSelectorField } from "./courses/form/CompanyMultiSelectorField";
import { JobRolesSelectorField } from "./courses/form/JobRolesSelectorField";

export const CourseForm: React.FC<CourseFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting,
  onClose,
  availableCompanies = [],
  showCompanySelector = true,
  preselectedCompanyId,
}) => {
  // Initialize companyIds with preselectedCompanyId if available
  const initialCompanyIds = preselectedCompanyId 
    ? [preselectedCompanyId]
    : Array.isArray((initialData as any)?.companyIds)
      ? (initialData as any)?.companyIds
      : (initialData as any)?.companyId
        ? [(initialData as any)?.companyId]
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

  // Watch for company changes to reset job roles selection
  const watchedCompanyIds = form.watch("companyIds");
  
  useEffect(() => {
    // Reset job roles when companies change
    form.setValue("jobRoleIds", []);
  }, [watchedCompanyIds, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {showCompanySelector && availableCompanies.length > 0 && (
          <CompanyMultiSelectorField 
            form={form} 
            companies={availableCompanies}
          />
        )}

        <CourseFormFields form={form} />

        <TagsField form={form} />

        <JobRolesSelectorField 
          form={form} 
          companyIds={watchedCompanyIds || []}
        />

        <FormActions 
          onCancel={onClose || onCancel} 
          isSubmitting={isSubmitting} 
          isEditing={!!initialData}
          showCompanySelector={showCompanySelector}
          companySelected={(form.watch("companyIds") || []).length > 0}
        />
      </form>
    </Form>
  );
};
