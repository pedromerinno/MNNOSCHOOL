
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Video } from "lucide-react";
import { SubmitButton } from "./form/SubmitButton";

// Schema for video form
const videoFormSchema = z.object({
  video_institucional: z.string().url("URL inválida").or(z.string().length(0)),
  descricao_video: z.string().optional(),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

interface IntegrationVideosManagerProps {
  company: Company;
}

export const IntegrationVideosManager: React.FC<IntegrationVideosManagerProps> = ({ company }) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      video_institucional: company.video_institucional || "",
      descricao_video: company.descricao_video || "",
    }
  });
  
  const onSubmit = async (data: VideoFormValues) => {
    setIsSaving(true);
    
    try {
      console.log("Saving video info for company:", company.nome);
      
      const { error } = await supabase
        .from('empresas')
        .update({
          video_institucional: data.video_institucional || null,
          descricao_video: data.descricao_video || null,
        })
        .eq('id', company.id);
        
      if (error) throw error;
      
      toast.success("Informações de vídeo atualizadas com sucesso");
      
      // Disparar evento para atualizar dados da empresa em outros componentes
      window.dispatchEvent(new Event('company-relation-changed'));
      
    } catch (error: any) {
      console.error("Erro ao salvar vídeo:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getVideoPreview = () => {
    const videoUrl = form.watch("video_institucional");
    
    if (!videoUrl) return null;
    
    // Extract YouTube video ID
    let videoId = "";
    if (videoUrl.includes("youtube.com/watch?v=")) {
      videoId = new URL(videoUrl).searchParams.get("v") || "";
    } else if (videoUrl.includes("youtu.be/")) {
      videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0] || "";
    }
    
    if (!videoId) return null;
    
    return (
      <div className="aspect-video w-full mt-4">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Video Institucional"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Vídeos Institucionais</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Adicione vídeos para exibir durante o processo de integração
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="video_institucional"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Vídeo Institucional</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {getVideoPreview()}
              
              <FormField
                control={form.control}
                name="descricao_video"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Vídeo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o vídeo institucional..." 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <SubmitButton isSaving={isSaving} />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
