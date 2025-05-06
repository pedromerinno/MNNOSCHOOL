import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { SubmitButton } from "./form/SubmitButton";
import { VideoPlaylistManager } from "./VideoPlaylistManager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
interface IntegrationVideosManagerProps {
  company: Company;
}
export const IntegrationVideosManager: React.FC<IntegrationVideosManagerProps> = ({
  company
}) => {
  const [videoUrl, setVideoUrl] = useState(company.video_institucional || "");
  const [videoDescription, setVideoDescription] = useState(company.descricao_video || "");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("main");
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
      const {
        error
      } = await supabase.from('empresas').update({
        video_institucional: videoUrl,
        descricao_video: videoDescription
      }).eq('id', company.id);
      if (error) throw error;
      toast.success("Vídeo institucional atualizado com sucesso");

      // Disparar evento para atualizar dados da empresa em outros componentes
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
  const videoId = getYoutubeVideoId(videoUrl);
  return <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="main">Vídeo Institucional</TabsTrigger>
          <TabsTrigger value="playlist">Playlist de Vídeos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="main" className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Vídeo Institucional</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Adicione um vídeo de apresentação da empresa que será exibido na página de integração
            </p>
          </div>
          
          
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo (YouTube)</Label>
              <Input id="videoUrl" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={!isValidYoutubeUrl(videoUrl) ? "border-red-500" : ""} />
              {!isValidYoutubeUrl(videoUrl) && videoUrl && <p className="text-red-500 text-sm mt-1">URL do YouTube inválida</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoDescription">Descrição do Vídeo</Label>
              <Textarea id="videoDescription" value={videoDescription} onChange={e => setVideoDescription(e.target.value)} placeholder="Descreva brevemente o conteúdo do vídeo..." rows={3} />
            </div>
            
            {videoId ? <div className="aspect-w-16 aspect-h-9">
                <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}`} className="w-full rounded-lg" style={{
              aspectRatio: '16/9'
            }} allowFullScreen frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Video Institucional" />
              </div> : <Card>
                <CardContent className="p-6 text-center">
                  <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Adicione uma URL do YouTube válida para visualizar o vídeo
                  </p>
                </CardContent>
              </Card>}
            
            <div className="flex justify-end">
              <SubmitButton isSaving={isSaving} />
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="playlist" className="mt-6">
          <VideoPlaylistManager company={company} />
        </TabsContent>
      </Tabs>
    </div>;
};