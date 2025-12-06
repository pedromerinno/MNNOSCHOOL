
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { LessonFormFields } from './form/LessonFormFields';
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
  courseId,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="lesson-form">
        <LessonFormFields form={form} lessonId={initialData?.id} />
      </form>
    </Form>
  );
};
