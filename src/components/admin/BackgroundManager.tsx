
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload';
import { MediaTypeSelector } from './background/MediaTypeSelector';
import { FileUpload } from './background/FileUpload';
import { UrlInput } from './background/UrlInput';
import { MediaPreview } from './background/MediaPreview';

export const BackgroundManager = () => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [isSaving, setIsSaving] = useState(false);
  const { uploadFile, isUploading } = useBackgroundUpload();

  useEffect(() => {
    const fetchCurrentBackground = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value, media_type')
          .eq('key', 'login_background')
          .maybeSingle();

        if (!error && data) {
          setMediaUrl(data.value || "");
          setMediaType((data.media_type as "video" | "image") || "video");
        }
      } catch (error) {
        console.error("Error fetching background settings:", error);
      }
    };

    fetchCurrentBackground();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: existingRecord } = await supabase
        .from('settings')
        .select('id')
        .eq('key', 'login_background')
        .maybeSingle();
      
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: existingRecord?.id || undefined,
          key: 'login_background', 
          value: mediaUrl,
          media_type: mediaType,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(`Background ${mediaType === 'video' ? 'vídeo' : 'imagem'} atualizado com sucesso`);
      window.dispatchEvent(new Event('background-updated'));
    } catch (error: any) {
      console.error(`Erro ao salvar ${mediaType} de background:`, error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      toast.error('Por favor, selecione um arquivo de vídeo');
      return;
    }
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    const url = await uploadFile(file, mediaType);
    if (url) {
      setMediaUrl(url);
      handleSubmit(new Event('submit') as any);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Background da Página de Login</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Configure o background da página de login com uma imagem ou vídeo
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <MediaTypeSelector
              mediaType={mediaType}
              onMediaTypeChange={setMediaType}
            />

            <FileUpload
              mediaType={mediaType}
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
            />

            <UrlInput
              mediaUrl={mediaUrl}
              mediaType={mediaType}
              onUrlChange={setMediaUrl}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSaving || isUploading}
                className="bg-merinno-dark hover:bg-black text-white"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <MediaPreview mediaUrl={mediaUrl} mediaType={mediaType} />
    </div>
  );
};
