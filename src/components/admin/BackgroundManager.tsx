
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Video } from "lucide-react";

export const BackgroundManager = () => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCurrentBackground = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value, media_type')
        .eq('key', 'login_background')
        .single();

      if (!error && data) {
        setMediaUrl(data.value || "");
        setMediaType(data.media_type || "video");
      }
    };

    fetchCurrentBackground();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'login_background', 
          value: mediaUrl,
          media_type: mediaType,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(`Background ${mediaType} atualizado com sucesso`);
      
      // Dispatch event to update other components
      window.dispatchEvent(new Event('background-updated'));
    } catch (error: any) {
      console.error(`Erro ao salvar ${mediaType} de background:`, error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
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
              <Label htmlFor="mediaUrl">
                {mediaType === 'video' ? 'URL do Vídeo' : 'URL da Imagem'}
              </Label>
              <Input
                id="mediaUrl"
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={mediaType === 'video' 
                  ? "https://exemplo.com/video.mp4" 
                  : "https://exemplo.com/imagem.jpg"}
                required
              />
              <p className="text-sm text-gray-500">
                {mediaType === 'video' 
                  ? 'Insira a URL de um vídeo MP4' 
                  : 'Insira a URL de uma imagem'}
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSaving}
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
