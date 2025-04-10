
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, Save, Plus, Video, Trash2, PlusCircle } from "lucide-react";
import { Company } from "@/types/company";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const videoFormSchema = z.object({
  video_institucional: z.string().url("URL inválida").or(z.string().length(0)).nullable(),
  descricao_video: z.string().max(1000, "Descrição muito longa").nullable(),
});

interface IntegrationVideosManagerProps {
  company: Company;
}

export const IntegrationVideosManager: React.FC<IntegrationVideosManagerProps> = ({
  company
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof videoFormSchema>>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      video_institucional: company.video_institucional || "",
      descricao_video: company.descricao_video || "",
    },
  });

  React.useEffect(() => {
    // Atualizar formulário quando a empresa mudar
    form.reset({
      video_institucional: company.video_institucional || "",
      descricao_video: company.descricao_video || "",
    });
  }, [company, form]);

  const onSubmit = async (data: z.infer<typeof videoFormSchema>) => {
    setIsSaving(true);
    
    try {
      // Atualizar informações de vídeo da empresa
      const { error } = await supabase
        .from('empresas')
        .update({
          video_institucional: data.video_institucional,
          descricao_video: data.descricao_video,
        })
        .eq('id', company.id);
        
      if (error) throw error;
      
      toast.success("Vídeo de integração atualizado com sucesso");
      
      // Disparar evento para atualizar dados da empresa em outros componentes
      window.dispatchEvent(new Event('company-relation-changed'));
      
    } catch (error: any) {
      console.error("Erro ao salvar vídeo:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para extrair thumbnail do vídeo do YouTube
  const getYouTubeThumbnail = (url: string | null): string => {
    if (!url) return 'https://placehold.co/600x400/eee/ccc?text=Nenhum+vídeo';
    
    try {
      // Extrair ID do vídeo do YouTube (funciona com diversos formatos de URL)
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1].split('?')[0];
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    } catch (e) {
      console.error('Erro ao processar URL do vídeo:', e);
    }
    
    return 'https://placehold.co/600x400/eee/ccc?text=Formato+inválido';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-medium">Vídeo Institucional</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Este vídeo será exibido como destaque na seção de integração
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <img 
                  src={getYouTubeThumbnail(company.video_institucional)} 
                  alt="Thumbnail do vídeo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="video_institucional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Vídeo</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="descricao_video"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do Vídeo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição do vídeo institucional"
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Vídeo
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Vídeos da Playlist</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerencie os vídeos adicionais que aparecerão na playlist de integração
              </p>
            </div>
            <Button variant="outline" disabled>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Vídeo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800">
            <Video className="mx-auto h-8 w-8 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Biblioteca de Vídeos</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              Esta funcionalidade está em desenvolvimento. Em breve você poderá adicionar 
              múltiplos vídeos à playlist de integração.
            </p>
            <Button disabled>
              Em breve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
