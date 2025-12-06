
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { SubmitButton } from "./SubmitButton";

interface VideoFormProps {
  company: Company;
}

export const VideoForm: React.FC<VideoFormProps> = ({
  company
}) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentCompanyData, setCurrentCompanyData] = useState<Company>(company);

  // Função para buscar dados atualizados da empresa
  const fetchUpdatedCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', company.id)
        .single();

      if (error) {
        console.error("Error fetching updated company data:", error);
        return;
      }

      if (data) {
        setCurrentCompanyData(data);
        setVideoUrl(data.video_institucional || "");
        setVideoDescription(data.descricao_video || "");
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  // Inicializar dados quando o componente monta ou a empresa muda
  useEffect(() => {
    setCurrentCompanyData(company);
    setVideoUrl(company.video_institucional || "");
    setVideoDescription(company.descricao_video || "");
  }, [company.id]);

  // Buscar dados atualizados quando o componente monta
  useEffect(() => {
    fetchUpdatedCompanyData();
  }, [company.id]);

  // Escutar mudanças globais da empresa
  useEffect(() => {
    const handleCompanyUpdate = (event: CustomEvent) => {
      const { company: updatedCompany } = event.detail;
      if (updatedCompany && updatedCompany.id === company.id) {
        setCurrentCompanyData(updatedCompany);
        setVideoUrl(updatedCompany.video_institucional || "");
        setVideoDescription(updatedCompany.descricao_video || "");
      }
    };

    const handleForceRefresh = () => {
      fetchUpdatedCompanyData();
    };

    window.addEventListener('company-data-updated', handleCompanyUpdate as EventListener);
    window.addEventListener('force-company-refresh', handleForceRefresh);
    window.addEventListener('company-relation-changed', handleForceRefresh);
    window.addEventListener('integration-data-updated', handleCompanyUpdate as EventListener);

    return () => {
      window.removeEventListener('company-data-updated', handleCompanyUpdate as EventListener);
      window.removeEventListener('force-company-refresh', handleForceRefresh);
      window.removeEventListener('company-relation-changed', handleForceRefresh);
      window.removeEventListener('integration-data-updated', handleCompanyUpdate as EventListener);
    };
  }, [company.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validar URL do YouTube
      if (videoUrl && !isValidYoutubeUrl(videoUrl)) {
        toast.error("Por favor, insira uma URL válida do YouTube");
        setIsSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from('empresas')
        .update({
          video_institucional: videoUrl,
          descricao_video: videoDescription
        })
        .eq('id', company.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local com dados retornados do banco
      if (data) {
        setCurrentCompanyData(data);
        setVideoUrl(data.video_institucional || "");
        setVideoDescription(data.descricao_video || "");
      }

      toast.success("Vídeo institucional atualizado com sucesso");

      // Disparar eventos para notificar outros componentes
      window.dispatchEvent(new CustomEvent('company-data-updated', { 
        detail: { company: data } 
      }));
      window.dispatchEvent(new CustomEvent('integration-data-updated', { 
        detail: { company: data } 
      }));
      window.dispatchEvent(new Event('company-relation-changed'));

    } catch (error: any) {
      console.error("Erro ao salvar vídeo institucional:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Validar URL do YouTube
  const isValidYoutubeUrl = (url: string) => {
    if (!url) return true; // Vazio é válido

    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([^#&?]*).*/;
    return regExp.test(url);
  };

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(currentCompanyData.video_institucional || "");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Vídeo Institucional</h3>
        <p className="text-sm text-muted-foreground">Adicione um vídeo de apresentação da empresa que será exibido na página de integração</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="videoUrl">URL do Vídeo (YouTube)</Label>
          <Input 
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={!isValidYoutubeUrl(videoUrl) ? "border-red-500" : ""}
          />
          {!isValidYoutubeUrl(videoUrl) && videoUrl && (
            <p className="text-red-500 text-sm mt-1">URL do YouTube inválida</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="videoDescription">Descrição do Vídeo</Label>
          <Textarea 
            id="videoDescription"
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            placeholder="Descreva brevemente o conteúdo do vídeo..."
            rows={3}
          />
        </div>
        
        {videoId ? (
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              className="w-full rounded-lg"
              style={{ aspectRatio: '16/9' }}
              allowFullScreen 
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Video Institucional"
            />
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center py-[60px]">
              <Video className="h-12 w-8 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Adicione uma URL do YouTube válida para visualizar o vídeo
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-end pt-6 border-t">
          <SubmitButton isSaving={isSaving} />
        </div>
      </form>
    </div>
  );
};









