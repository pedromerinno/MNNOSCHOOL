
import { z } from "zod";

export const integrationFormSchema = z.object({
  historia: z.string().optional().nullable(),
  missao: z.string().optional().nullable(),
  valores: z.string().optional().nullable(),
  frase_institucional: z.string().optional().nullable(),
  cor_principal: z.string().min(4, "Cor inválida").default("#1EAEDB"),
});

export type IntegrationFormValues = z.infer<typeof integrationFormSchema>;
