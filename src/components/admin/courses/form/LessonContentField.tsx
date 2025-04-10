
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { LessonFormValues } from "./LessonFormTypes";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
          
          {selectedType === "video" && (
            <Alert variant="default" className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-600 dark:text-blue-300">
                Use URLs no formato <code>https://www.youtube.com/watch?v=XXXX</code> ou <code>https://youtu.be/XXXX</code>. 
                O sistema automaticamente converterá para o formato de incorporação adequado.
              </AlertDescription>
            </Alert>
          )}
          
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
          
          {selectedType === "video" && (
            <FormDescription>
              Para melhor compatibilidade, recomendamos usar vídeos do YouTube.
            </FormDescription>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
