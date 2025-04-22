
import { z } from "zod";
import { Course } from "../../courses/types";

// companyIds agora é um array obrigatório, sempre presente
export const courseSchema = z.object({
  id: z.string().optional(), // Add id field as optional
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  instructor: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  companyIds: z.array(z.string()).min(1, "Selecione ao menos uma empresa"), // multi-empresa
});

export type CourseFormValues = z.infer<typeof courseSchema>;

export interface CourseFormProps {
  initialData?: Course | CourseFormValues | null;
  onSubmit: (data: CourseFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  onClose?: () => void;
  // Passa a lista de empresas do usuário logado
  availableCompanies?: { id: string; nome: string; logo?: string }[];
  showCompanySelector?: boolean;
  preselectedCompanyId?: string;
}
