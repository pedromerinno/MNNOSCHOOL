
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Course } from './CourseManagement';

const courseSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  instructor: z.string().nullable().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialData?: Course;
  onSubmit: (data: CourseFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CourseForm: React.FC<CourseFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      image_url: initialData?.image_url || "",
      instructor: initialData?.instructor || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Curso</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título do curso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite a descrição do curso" 
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
          name="instructor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instrutor</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome do instrutor" 
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
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input
                  placeholder="URL da imagem do curso" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar Curso' : 'Criar Curso'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
