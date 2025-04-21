
import { z } from "zod";
import { Course } from "../../courses/types";

export const courseSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  instructor: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  companyId: z.string().optional(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

export interface CourseFormProps {
  initialData?: Course | CourseFormValues | null;
  onSubmit: (data: CourseFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  onClose?: () => void;
  preselectedCompanyId?: string;
  showCompanySelector?: boolean;
}
