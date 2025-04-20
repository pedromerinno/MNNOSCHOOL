
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const BackgroundVideoManager = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCurrentVideoUrl = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'login_background_video')
        .single();

      if (!error && data) {
        setVideoUrl(data.value || "");
      }
    };

    fetchCurrentVideoUrl();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // First check if the record already exists
      const { data: existingRecord } = await supabase
        .from('settings')
        .select('id')
        .eq('key', 'login_background_video')
        .single();
      
      // Use upsert with the correct ID if it exists
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: existingRecord?.id || undefined,
          key: 'login_background_video', 
          value: videoUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("URL do vídeo de background atualizada com sucesso");
    } catch (error: any) {
      console.error("Erro ao salvar URL do vídeo:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Vídeo de Background do Login</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Configure o vídeo que será exibido no background da página de login
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo</Label>
              <Input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://exemplo.com/video.mp4"
                required
              />
              <p className="text-sm text-gray-500">
                Insira a URL de um vídeo MP4 que será usado como background na página de login
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
