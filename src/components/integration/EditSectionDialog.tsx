import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { ValuesField } from "@/components/admin/integration/form/ValuesField";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { VideoPlaylistManager } from "@/components/admin/integration/VideoPlaylistManager";

const cultureFormSchema = z.object({
  missao: z.string().optional(),
  valores: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).optional(),
  video_institucional: z.string().optional(),
  descricao_video: z.string().optional(),
});

const videoFormSchema = z.object({
  video_institucional: z.string().optional(),
  descricao_video: z.string().optional(),
});

type CultureFormData = z.infer<typeof cultureFormSchema>;
type VideoFormData = z.infer<typeof videoFormSchema>;

interface EditSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  company: Company | null;
  companyColor?: string;
  onSuccess?: () => void;
}

export const EditSectionDialog: React.FC<EditSectionDialogProps> = ({
  open,
  onOpenChange,
  sectionId,
  company,
  companyColor,
  onSuccess
}) => {
  const [isSaving, setIsSaving] = useState(false);

  // Form para Cultura (Missão e Valores)
  const cultureForm = useForm<CultureFormData>({
    resolver: zodResolver(cultureFormSchema),
    defaultValues: {
      missao: "",
      valores: [],
      video_institucional: "",
      descricao_video: ""
    }
  });

  // Form para Vídeos
  const videoForm = useForm<VideoFormData>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      video_institucional: "",
      descricao_video: ""
    }
  });

  // Carregar dados iniciais quando o diálogo abrir
  useEffect(() => {
    if (open && company) {
      if (sectionId === 'cultura' || sectionId === 'info') {
        // Parse valores
        let parsedValores = [];
        try {
          if (company.valores && typeof company.valores === 'string') {
            parsedValores = JSON.parse(company.valores);
          } else if (Array.isArray(company.valores)) {
            parsedValores = company.valores;
          }
        } catch (e) {
          console.error("Error parsing valores:", e);
          parsedValores = [];
        }

        cultureForm.reset({
          missao: company.missao || "",
          valores: parsedValores,
          video_institucional: company.video_institucional || "",
          descricao_video: company.descricao_video || ""
        });
      } else if (sectionId === 'videos') {
        videoForm.reset({
          video_institucional: company.video_institucional || "",
          descricao_video: company.descricao_video || ""
        });
      }
    }
  }, [open, company, sectionId]);

  const handleCultureSubmit = async (data: CultureFormData) => {
    if (!company) return;

    setIsSaving(true);
    try {
      let processedData: any = { ...data };

      // Processar valores
      if (processedData.valores) {
        if (Array.isArray(processedData.valores)) {
          processedData.valores = JSON.stringify(processedData.valores);
        }
      }

      // Remover valores do objeto se for undefined para não sobrescrever
      if (processedData.valores === undefined) {
        delete processedData.valores;
      }

      const { error } = await supabase
        .from('empresas')
        .update(processedData)
        .eq('id', company.id);

      if (error) throw error;

      toast.success("Informações atualizadas com sucesso");

      // Disparar eventos para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('company-data-updated', { 
        detail: { company: { ...company, ...processedData } } 
      }));
      window.dispatchEvent(new Event('company-relation-changed'));

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoSubmit = async (data: VideoFormData) => {
    if (!company) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .update(data)
        .eq('id', company.id);

      if (error) throw error;

      toast.success("Vídeo atualizado com sucesso");

      // Disparar eventos para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('company-data-updated', { 
        detail: { company: { ...company, ...data } } 
      }));
      window.dispatchEvent(new Event('company-relation-changed'));

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const cultureSections: SettingsSection[] = useMemo(() => {
    return [
      {
        id: 'missao',
        label: 'Missão',
        content: (
          <FormField
            control={cultureForm.control}
            name="missao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Missão da Empresa</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Digite a missão da empresa"
                    className="min-h-[150px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      },
      {
        id: 'valores',
        label: 'Valores',
        content: (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Valores da Empresa</h3>
              <p className="text-sm text-gray-500">Adicione os valores que representam sua empresa</p>
            </div>
            <ValuesField form={cultureForm} />
          </div>
        )
      },
      {
        id: 'video',
        label: 'Vídeo Institucional',
        content: (
          <div className="space-y-6">
            <FormField
              control={cultureForm.control}
              name="video_institucional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Vídeo Institucional</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={cultureForm.control}
              name="descricao_video"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Vídeo</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descrição do vídeo institucional"
                      className="min-h-[150px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
      }
    ];
  }, [cultureForm]);

  const videoSections: SettingsSection[] = useMemo(() => {
    return [
      {
        id: 'video',
        label: 'Vídeo Institucional',
        content: (
          <div className="space-y-6">
            <FormField
              control={videoForm.control}
              name="video_institucional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Vídeo Institucional</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={videoForm.control}
              name="descricao_video"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Vídeo</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descrição do vídeo institucional"
                      className="min-h-[150px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
      }
    ];
  }, [videoForm]);

  const getDialogContent = () => {
    if (sectionId === 'cultura' || sectionId === 'info') {
      return (
        <Form {...cultureForm}>
          <HorizontalSettingsDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Editar Missão e Valores"
            sections={cultureSections}
            defaultSectionId="missao"
            onCancel={() => onOpenChange(false)}
            onSave={cultureForm.handleSubmit(handleCultureSubmit)}
            saveLabel="Salvar"
            cancelLabel="Cancelar"
            isSaving={isSaving}
            isFormValid={true}
            saveButtonStyle={{
              backgroundColor: companyColor || '#1EAEDB',
              borderColor: companyColor || '#1EAEDB',
            }}
          />
        </Form>
      );
    } else if (sectionId === 'videos') {
      // Para vídeos, mostrar o gerenciador de playlist
      if (!company) return null;
      
      return (
        <HorizontalSettingsDialog
          open={open}
          onOpenChange={onOpenChange}
          title="Gerenciar Playlist de Integração"
          sections={[
            {
              id: 'playlist',
              label: 'Playlist',
              content: (
                <div className="py-4">
                  <VideoPlaylistManager company={company} />
                </div>
              )
            }
          ]}
          defaultSectionId="playlist"
          onCancel={() => onOpenChange(false)}
          saveLabel="Fechar"
          cancelLabel=""
          isSaving={false}
          isFormValid={true}
          saveButtonStyle={{
            backgroundColor: companyColor || '#1EAEDB',
            borderColor: companyColor || '#1EAEDB',
          }}
          onSave={() => {
            onSuccess?.();
            onOpenChange(false);
          }}
          getCancelButton={() => null}
          alwaysShowSidebar={false}
        />
      );
    }

    return null;
  };

  return getDialogContent();
};
