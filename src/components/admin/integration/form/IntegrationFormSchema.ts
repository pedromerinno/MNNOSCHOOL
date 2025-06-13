
import { z } from "zod";

export const integrationFormSchema = z.object({
  nome: z.string().min(1, "Nome da empresa é obrigatório"),
  frase_institucional: z.string().optional().nullable(),
  missao: z.string().optional().nullable(),
  historia: z.string().optional().nullable(),
  valores: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).default([]),
  cor_principal: z.string().min(4, "Cor inválida").default("#1EAEDB"),
  logo: z.string().optional().nullable(),
});

export type IntegrationFormValues = z.infer<typeof integrationFormSchema>;

// Schema for the access management form
export const accessFormSchema = z.object({
  tool_name: z.string().min(1, "Nome da ferramenta é obrigatório"),
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
  url: z.string().optional(),
  notes: z.string().optional(),
});

export type AccessFormValues = z.infer<typeof accessFormSchema>;
