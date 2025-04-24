
import React, { useCallback } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import debounce from 'lodash/debounce';

interface LessonContentFieldProps {
  form: UseFormReturn<LessonFormValues>;
  selectedType: "video" | "text" | "quiz";
}

export const LessonContentField: React.FC<LessonContentFieldProps> = ({ 
  form, 
  selectedType 
}) => {
  const { toast } = useToast();

  const fetchLoomMetadata = useCallback(
    debounce(async (url: string) => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-loom-metadata', {
          body: { url }
        });

        if (error) throw error;

        if (data) {
          // Update form fields with the fetched metadata
          form.setValue('title', data.title, { shouldDirty: true });
          form.setValue('description', data.description, { shouldDirty: true });
          form.setValue('duration', data.duration, { shouldDirty: true });

          toast({
            title: "Video details fetched",
            description: "Title and description have been updated from Loom.",
          });
        }
      } catch (error) {
        console.error('Error fetching Loom metadata:', error);
        toast({
          title: "Error fetching video details",
          description: "Please make sure you've entered a valid Loom URL.",
          variant: "destructive",
        });
      }
    }, 1000),
    [form, toast]
  );

  const handleUrlChange = (value: string) => {
    if (selectedType === "video" && value.includes("loom.com")) {
      fetchLoomMetadata(value);
    }
  };

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
                Use URLs do YouTube (<code>youtube.com/watch?v=XXXX</code> ou <code>youtu.be/XXXX</code>) ou 
                do Loom (<code>loom.com/share/XXXX</code>). 
                O sistema converterá automaticamente para o formato adequado.
              </AlertDescription>
            </Alert>
          )}
          
          <FormControl>
            <Textarea 
              placeholder={
                selectedType === "video" 
                  ? "https://www.youtube.com/watch?v=... ou https://www.loom.com/share/..." 
                  : selectedType === "text" 
                    ? "Conteúdo detalhado da aula em texto..." 
                    : "Formato JSON com perguntas e respostas..."
              }
              className="min-h-[150px]"
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleUrlChange(e.target.value);
              }}
              value={field.value || ""}
            />
          </FormControl>
          
          {selectedType === "video" && (
            <FormDescription>
              Para melhor compatibilidade, recomendamos usar vídeos do YouTube ou Loom.
              {selectedType === "video" && " Cole um link do Loom para preencher automaticamente o título e descrição."}
            </FormDescription>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
