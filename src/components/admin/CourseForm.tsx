
import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { courseSchema, CourseFormValues, CourseFormProps } from './courses/form/CourseFormTypes';
import { CourseFormFields } from './courses/form/CourseFormFields';
import { TagsField } from './courses/form/TagsField';
import { FormActions } from './courses/form/FormActions';
import { CompanyMultiSelectorField } from "./courses/form/CompanyMultiSelectorField";

export const CourseForm: React.FC<CourseFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting,
  onClose,
  availableCompanies = [],
  showCompanySelector = true, // Add default value
}) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      image_url: initialData?.image_url || "",
      instructor: initialData?.instructor || "",
      tags: initialData?.tags || [],
      companyIds: Array.isArray((initialData as any)?.companyIds)
        ? (initialData as any)?.companyIds
        : (initialData as any)?.companyId
        ? [(initialData as any)?.companyId]
        : [],
    },
  });

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
