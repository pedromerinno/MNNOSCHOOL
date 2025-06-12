
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
import { Company, CompanyValue } from "@/types/company";
import DragDropImageUpload from '@/components/ui/DragDropImageUpload';
import { CompanyValuesField } from './CompanyValuesField';

const companySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  logo: z.string().optional().nullable(),
  frase_institucional: z.string().optional().nullable(),
  missao: z.string().optional().nullable(),
  historia: z.string().optional().nullable(),
  valores: z.array(z.object({
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória")
  })).optional(),
  video_institucional: z.string().optional().nullable(),
  descricao_video: z.string().optional().nullable(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  initialData?: Company;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  // Parse valores if it's a string and ensure it conforms to CompanyValue interface
  let parsedValores: CompanyValue[] = [];
  try {
    if (initialData?.valores && typeof initialData.valores === 'string') {
      const parsed = JSON.parse(initialData.valores);
      // Ensure each parsed value has the required properties
      parsedValores = Array.isArray(parsed) ? parsed.filter((item: any) => 
        item && typeof item.title === 'string' && typeof item.description === 'string'
      ).map((item: any): CompanyValue => ({
        title: item.title || '',
        description: item.description || ''
      })) : [];
    } else if (Array.isArray(initialData?.valores)) {
      // Ensure the array items conform to CompanyValue interface
      parsedValores = initialData.valores.filter((item: any) => 
        item && typeof item.title === 'string' && typeof item.description === 'string'
      ).map((item: any): CompanyValue => ({
        title: item.title || '',
        description: item.description || ''
      }));
    }
  } catch (e) {
    console.error("Error parsing valores:", e);
    parsedValores = [];
  }

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nome: initialData?.nome || "",
      logo: initialData?.logo || "",
      frase_institucional: initialData?.frase_institucional || "",
      missao: initialData?.missao || "",
      historia: initialData?.historia || "",
      valores: parsedValores,
      video_institucional: initialData?.video_institucional || "",
      descricao_video: initialData?.descricao_video || "",
    },
  });

  const handleFormSubmit = async (data: CompanyFormValues) => {
    // Convert valores array to JSON string for storage
    const processedData = {
      ...data,
      valores: data.valores && data.valores.length > 0 ? JSON.stringify(data.valores) : null
    };
    await onSubmit(processedData);
  };

  // Ensure watched valores conform to CompanyValue interface
  const watchedValores = form.watch('valores') || [];
  const conformedValores: CompanyValue[] = watchedValores.map(value => ({
    title: value?.title || '',
    description: value?.description || ''
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
              <FormLabel>Logo da Empresa</FormLabel>
              <FormControl>
                <DragDropImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  objectPrefix={initialData?.id || 'company'}
                  bucketName="company-assets"
                  storagePath="logos"
                  label="Arraste e solte o logo aqui ou clique para selecionar"
                />
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
          name="video_institucional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vídeo Institucional</FormLabel>
              <FormControl>
                <Input 
                  placeholder="URL do vídeo institucional" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao_video"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Vídeo</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição do vídeo institucional" 
                  {...field} 
                  value={field.value || ""}
                  rows={2}
                />
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

        <CompanyValuesField
          values={conformedValores}
          onChange={(values) => form.setValue('valores', values)}
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
