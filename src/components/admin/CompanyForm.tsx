
import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Company } from "@/types/company";

const companySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  logo: z.string().optional().nullable(),
  frase_institucional: z.string().optional().nullable(),
  missao: z.string().optional().nullable(),
  historia: z.string().optional().nullable(),
  valores: z.string().optional().nullable(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  initialData?: Company;
  onSubmit: (data: CompanyFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nome: initialData?.nome || "",
      logo: initialData?.logo || "",
      frase_institucional: initialData?.frase_institucional || "",
      missao: initialData?.missao || "",
      historia: initialData?.historia || "",
      valores: initialData?.valores || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa*</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Logo</FormLabel>
              <FormControl>
                <Input placeholder="URL da imagem do logo" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frase_institucional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frase Institucional</FormLabel>
              <FormControl>
                <Input placeholder="Frase institucional" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="missao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Missão</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a missão da empresa" 
                  {...field} 
                  value={field.value || ""}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="historia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>História</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a história da empresa" 
                  {...field} 
                  value={field.value || ""}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valores"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valores</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva os valores da empresa" 
                  {...field} 
                  value={field.value || ""}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
