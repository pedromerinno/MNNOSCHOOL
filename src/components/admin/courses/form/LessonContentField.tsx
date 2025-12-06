
import React, { useCallback } from 'react';
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
import { VideoUploadField } from "./VideoUploadField";
import { useCompanies } from '@/hooks/useCompanies';

interface LessonContentFieldProps {
  form: UseFormReturn<LessonFormValues>;
  selectedType: "video" | "text" | "quiz";
  lessonId?: string;
}

export const LessonContentField: React.FC<LessonContentFieldProps> = ({ 
  form, 
  selectedType,
  lessonId
}) => {
  const { selectedCompany } = useCompanies();

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
            {selectedType === "video" ? (
              <div className="space-y-4">
                {selectedCompany?.id ? (
                  <VideoUploadField 
                    value={field.value?.startsWith('mux-video-') || field.value?.includes('supabase') || field.value?.includes('storage') || field.value?.includes('stream.mux.com') ? field.value : null}
                    onChange={(url) => {
                      // Quando faz upload, substitui qualquer valor anterior
                      field.onChange(url);
                    }}
                    companyId={selectedCompany.id}
                  />
                ) : (
                  <div className="text-sm text-gray-500 p-4 border rounded-lg">
                    Selecione uma empresa para fazer upload de vídeos
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  <p>Ou cole uma URL de vídeo externa:</p>
                </div>
                <Textarea 
                  placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
                  className="min-h-[80px]"
                  value={field.value && !field.value.startsWith('mux-video-') && !field.value.includes('supabase') && !field.value.includes('storage') && !field.value.includes('stream.mux.com') ? field.value : ""}
                  onChange={(e) => {
                    const url = e.target.value;
                    // Se é uma URL válida ou está vazio, usar ela
                    if (url.startsWith('http') || url === '') {
                      field.onChange(url);
                    }
                  }}
                />
              </div>
            ) : (
              <Textarea 
                placeholder={
                  selectedType === "text" 
                    ? "Conteúdo detalhado da aula em texto..." 
                    : "Formato JSON com perguntas e respostas..."
                }
                className="min-h-[150px]"
                {...field}
                value={field.value || ""}
              />
            )}
          </FormControl>
          
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
