
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "./CourseFormTypes";
import { ImageUploadField } from "./ImageUploadField";

interface CourseFormFieldsProps {
  form: UseFormReturn<CourseFormValues>;
}

export const CourseFormFields: React.FC<CourseFormFieldsProps> = ({ form }) => {
  return (
    <>
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
    </>
  );
};
