import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getYoutubeVideoId, getLoomVideoId } from "./utils";
import DragDropImageUpload from "@/components/ui/DragDropImageUpload";

interface AddVideoToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyColor: string;
  onVideoAdded?: () => void;
}

export const AddVideoToPlaylistDialog: React.FC<AddVideoToPlaylistDialogProps> = ({
  open,
  onOpenChange,
  companyId,
  companyColor,
  onVideoAdded
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    thumbnailType: 'auto' as 'auto' | 'url' | 'upload'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingVideosCount, setExistingVideosCount] = useState(0);

  useEffect(() => {
    if (open && companyId) {
      fetchVideosCount();
    }
  }, [open, companyId]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const fetchVideosCount = async () => {
    try {
      const { count, error } = await supabase
        .from('company_videos')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      if (error) throw error;
      setExistingVideosCount(count || 0);
    } catch (error) {
      console.error('Error fetching videos count:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration: '',
      thumbnailType: 'auto'
    });
  };

  const validateVideoUrl = (url: string): boolean => {
    if (!url) return false;
    
    // YouTube validation
    const youtubeRegExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([^#&?]*).*/;
    if (youtubeRegExp.test(url)) return true;
    
    // Loom validation
    const loomRegExp = /^(?:https?:\/\/)?(?:www\.)?loom\.com\/(?:share|embed)\/([a-zA-Z0-9-]+)/;
    if (loomRegExp.test(url)) return true;
    
    return false;
  };

  const extractThumbnailFromVideo = (url: string): string | null => {
    // YouTube thumbnail
    const youtubeId = getYoutubeVideoId(url);
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
    
    // Para Loom, não há uma URL de thumbnail padrão pública
    return null;
  };

  const handleSubmit = async () => {
    // Validações com feedback
    if (!formData.title.trim()) {
      toast.error('Por favor, informe o título do vídeo');
      return;
    }

    if (!formData.video_url.trim()) {
      toast.error('Por favor, informe a URL do vídeo');
      return;
    }

    if (!validateVideoUrl(formData.video_url)) {
      toast.error('URL do vídeo inválida. Use URLs do YouTube ou Loom.');
      return;
    }

    setIsSubmitting(true);

    try {
      let thumbnailUrl = formData.thumbnail_url;
      
      // Se for auto e não tem thumbnail, tentar extrair
      if (formData.thumbnailType === 'auto' && !thumbnailUrl) {
        const extractedThumbnail = extractThumbnailFromVideo(formData.video_url);
        if (extractedThumbnail) {
          thumbnailUrl = extractedThumbnail;
        }
      }

      const videoData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        video_url: formData.video_url.trim(),
        thumbnail_url: thumbnailUrl || null,
        duration: formData.duration.trim() || null,
        company_id: companyId,
        order_index: existingVideosCount
      };

      const { error } = await supabase
        .from('company_videos')
        .insert(videoData);

      if (error) throw error;

      toast.success('Vídeo adicionado com sucesso');
      resetForm();
      onVideoAdded?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving video:', error);
      toast.error('Erro ao salvar vídeo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.title.trim() !== '' && 
           formData.video_url.trim() !== '' && 
           validateVideoUrl(formData.video_url);
  };

  const handleThumbnailUpload = useCallback((url: string) => {
    setFormData(prev => ({ ...prev, thumbnail_url: url }));
  }, []);

  const sections: SettingsSection[] = useMemo(() => {
    const generalSectionContent = (
      <div className="space-y-4">
        {/* Grid com campos principais */}
        <div className="grid grid-cols-2 gap-4">
          {/* Título do Vídeo */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-900">
              Título do Vídeo
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do vídeo"
              required
              className="h-10"
            />
          </div>

          {/* URL do Vídeo */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="video_url" className="text-sm font-semibold text-gray-900">
              URL do Vídeo
            </Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
              placeholder="YouTube ou Loom"
              required
              className="h-10"
            />
            {formData.video_url && !validateVideoUrl(formData.video_url) && (
              <p className="text-red-500 text-xs mt-1">URL inválida</p>
            )}
            <p className="text-xs text-gray-500">Suporta YouTube e Loom</p>
          </div>

          {/* Duração */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-semibold text-gray-900">
              Duração (Opcional)
            </Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="Ex: 5 min"
              className="h-10"
            />
          </div>

          {/* Thumbnail Type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">
              Thumbnail
            </Label>
            <select
              value={formData.thumbnailType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                thumbnailType: e.target.value as 'auto' | 'url' | 'upload',
                thumbnail_url: e.target.value === 'auto' ? '' : prev.thumbnail_url
              }))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="auto">Automático</option>
              <option value="url">URL</option>
              <option value="upload">Upload</option>
            </select>
          </div>
        </div>

        {/* Thumbnail URL ou Upload baseado na seleção */}
        {formData.thumbnailType !== 'auto' && (
          <div className="space-y-2">
            {formData.thumbnailType === 'url' ? (
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                placeholder="https://exemplo.com/thumbnail.jpg"
                className="h-10"
              />
            ) : (
              <DragDropImageUpload
                value={formData.thumbnail_url}
                onChange={handleThumbnailUpload}
                objectPrefix="video-thumbnails"
                bucketName="company-assets"
                storagePath="thumbnails"
                label="Arraste e solte ou clique para selecionar"
              />
            )}
            {formData.thumbnail_url && (
              <div className="mt-2">
                <img
                  src={formData.thumbnail_url}
                  alt="Preview"
                  className="w-24 h-16 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
            Descrição (Opcional)
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva o conteúdo do vídeo..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>
    );

    return [
      {
        id: 'general',
        label: 'General',
        content: generalSectionContent
      }
    ];
  }, [formData, handleThumbnailUpload]);

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Vídeo à Playlist"
      sections={sections}
      defaultSectionId="general"
      onCancel={() => {
        resetForm();
        onOpenChange(false);
      }}
      onSave={handleSubmit}
      saveLabel="Adicionar"
      cancelLabel="Cancelar"
      isSaving={isSubmitting}
      isFormValid={isFormValid()}
      saveButtonStyle={isFormValid() ? { 
        backgroundColor: companyColor,
        borderColor: companyColor
      } : undefined}
      maxWidth="max-w-3xl"
      contentPadding="p-6 space-y-4"
    />
  );
};

