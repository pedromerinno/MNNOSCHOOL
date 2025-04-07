
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { LessonFormValues } from "./LessonFormTypes";

interface LessonContentFieldProps {
  form: UseFormReturn<LessonFormValues>;
  selectedType: "video" | "text" | "quiz";
}

export const LessonContentField: React.FC<LessonContentFieldProps> = ({ 
  form, 
  selectedType 
}) => {
  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {selectedType === "video" 
              ? "URL do Vídeo" 
              : selectedType === "text" 
                ? "Conteúdo da Aula" 
                : "Perguntas e Respostas do Quiz"}
          </FormLabel>
          <FormControl>
            <Textarea 
              placeholder={
                selectedType === "video" 
                  ? "https://www.youtube.com/watch?v=..." 
                  : selectedType === "text" 
                    ? "Conteúdo detalhado da aula em texto..." 
                    : "Formato JSON com perguntas e respostas..."
              }
              className="min-h-[150px]"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
