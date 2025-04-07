
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { LessonFormFields } from './form/LessonFormFields';
import { LessonFormActions } from './form/LessonFormActions';
import { 
  LessonFormProps, 
  LessonFormValues, 
  lessonSchema 
} from './form/LessonFormTypes';

export const LessonForm: React.FC<LessonFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      duration: initialData?.duration || "",
      type: (initialData?.type as "video" | "text" | "quiz") || "video",
      order_index: initialData?.order_index || 0,
    },
  });

  const handleSubmit = (values: LessonFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <LessonFormFields form={form} />
        <LessonFormActions 
          onCancel={onCancel} 
          isSubmitting={isSubmitting}
          isEditing={!!initialData?.id}
        />
      </form>
    </Form>
  );
};
