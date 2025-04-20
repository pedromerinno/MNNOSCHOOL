
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Video, Upload } from "lucide-react";
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload';

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
          .single();

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
      // First check if the record already exists
      const { data: existingRecord } = await supabase
        .from('settings')
        .select('id')
        .eq('key', 'login_background')
        .single();
      
      // Use upsert with the correct ID if it exists
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
      
      // Dispatch event to update other components
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

    // Validar o tipo do arquivo
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
            <div className="space-y-2">
              <Label>Tipo de Background</Label>
              <Select 
                value={mediaType} 
                onValueChange={(value: "video" | "image") => setMediaType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de mídia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-2" /> Vídeo
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 mr-2" /> Imagem
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload de Arquivo</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                {isUploading && (
                  <div className="text-sm text-gray-500">Enviando...</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaUrl">Ou insira uma URL</Label>
              <Input
                id="mediaUrl"
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={mediaType === 'video' 
                  ? "https://exemplo.com/video.mp4" 
                  : "https://exemplo.com/imagem.jpg"}
              />
              <p className="text-sm text-gray-500">
                {mediaType === 'video' 
                  ? 'Insira a URL de um vídeo MP4 ou faça upload' 
                  : 'Insira a URL de uma imagem ou faça upload'}
              </p>
            </div>

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
    </div>
  );
};
