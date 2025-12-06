
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { LessonFormValues } from "./LessonFormTypes";
import { LessonTypeField } from "./LessonTypeField";
import { LessonContentField } from "./LessonContentField";

interface LessonFormFieldsProps {
  form: UseFormReturn<LessonFormValues>;
  lessonId?: string;
}

export const LessonFormFields: React.FC<LessonFormFieldsProps> = ({ form, lessonId }) => {
  const selectedType = form.watch("type") as "video" | "text" | "quiz";

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título da Aula</FormLabel>
            <FormControl>
              <Input placeholder="Introdução ao Curso" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LessonTypeField form={form} />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração</FormLabel>
              <FormControl>
                <Input placeholder="10 min" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="order_index"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva o conteúdo desta aula" 
                {...field} 
                value={field.value || ""}
                className="min-h-[80px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <LessonContentField form={form} selectedType={selectedType} lessonId={lessonId} />
    </>
  );
};
