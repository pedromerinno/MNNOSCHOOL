
import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Course } from './CourseManagement';
import { courseSchema, CourseFormValues, CourseFormProps } from './courses/form/CourseFormTypes';
import { CourseFormFields } from './courses/form/CourseFormFields';
import { TagsField } from './courses/form/TagsField';
import { CompanySelectorField } from './courses/form/CompanySelectorField';
import { FormActions } from './courses/form/FormActions';

export { CourseFormProps };

export const CourseForm: React.FC<CourseFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting,
  onClose,
  preselectedCompanyId
}) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      image_url: initialData?.image_url || "",
      instructor: initialData?.instructor || "",
      tags: initialData?.tags || [],
      companyId: preselectedCompanyId || "",
    },
  });

  // Update form value when preselectedCompanyId changes
  useEffect(() => {
    if (preselectedCompanyId) {
      form.setValue("companyId", preselectedCompanyId);
    }
  }, [preselectedCompanyId, form]);

  // Determine if we need to show the company selector
  // Only show when creating a new course and no preselected company
  const showCompanySelector = !initialData && !preselectedCompanyId;
  
  // Check if a company is selected
  const companySelected = !!form.getValues("companyId");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CompanySelectorField 
          form={form} 
          showCompanySelector={showCompanySelector} 
        />
        
        <CourseFormFields form={form} />
        
        <TagsField form={form} />

        <FormActions 
          onCancel={onClose || onCancel} 
          isSubmitting={isSubmitting} 
          isEditing={!!initialData}
          showCompanySelector={showCompanySelector}
          companySelected={companySelected}
        />
      </form>
    </Form>
  );
};
