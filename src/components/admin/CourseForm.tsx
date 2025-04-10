
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ImageUploadField } from "./courses/form/ImageUploadField";

const courseSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  instructor: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export interface CourseFormProps {
  initialData?: Course | null;
  onSubmit: (data: CourseFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  onClose?: () => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting,
  onClose
}) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      image_url: initialData?.image_url || "",
      instructor: initialData?.instructor || "",
      tags: initialData?.tags || [],
    },
  });

  const [tagInput, setTagInput] = React.useState<string>("");

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue("tags", [...currentTags, tagInput.trim()]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

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

        <ImageUploadField 
          control={form.control}
          name="image_url"
          label="Capa do Curso"
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (para quem o curso é recomendado)</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {field.value?.map((tag) => (
                  <Badge key={tag} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)} 
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="designer, motion, developer..."
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addTag}
                >
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pressione Enter ou clique em "Adicionar" para incluir uma tag
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose || onCancel}
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
