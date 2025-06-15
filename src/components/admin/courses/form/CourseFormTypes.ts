
import * as z from "zod";

export const courseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  image_url: z.string().optional(),
  instructor: z.string().optional(),
  tags: z.array(z.string()).optional(),
  companyIds: z.array(z.string()).min(1, "Selecione pelo menos uma empresa"),
  jobRoleIds: z.array(z.string()).optional().default([]), // Array de IDs de cargos
});

export type CourseFormValues = z.infer<typeof courseSchema>;

export interface CourseFormProps {
  initialData?: Partial<CourseFormValues>;
  onSubmit: (data: CourseFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  onClose?: () => void;
  availableCompanies?: Array<{ id: string; nome: string }>;
  showCompanySelector?: boolean;
  preselectedCompanyId?: string;
}
