import { z } from "zod";
import { Lesson } from "@/components/courses/CourseLessonList";

// Extend the Lesson type to ensure it includes all fields we need
export interface ExtendedLesson extends Omit<Lesson, 'content' | 'course_id'> {
  content?: string;
  course_id?: string;
}

export const lessonSchema = z.object({
  title: z.string().min(3, { message: "O título precisa ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().optional(),
  type: z.enum(["video", "text", "quiz"]),
  order_index: z.coerce.number().int().min(0),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

export interface LessonFormProps {
  initialData?: Partial<ExtendedLesson>;
  onSubmit: (data: LessonFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}
