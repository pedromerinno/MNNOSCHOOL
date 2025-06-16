
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus, Trash2, Edit, GripVertical, Image, Link, Upload, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DragDropImageUpload from "@/components/ui/DragDropImageUpload";
import { getYoutubeVideoId, getLoomVideoId, getEmbedUrl } from "@/components/integration/video-playlist/utils";

interface CompanyVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  order_index: number;
}

interface VideoPlaylistManagerProps {
  company: Company;
}

export const VideoPlaylistManager: React.FC<VideoPlaylistManagerProps> = ({ company }) => {
  const [videos, setVideos] = useState<CompanyVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVideo, setEditingVideo] = useState<CompanyVideo | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    thumbnailType: 'auto' as 'auto' | 'url' | 'upload'
  });

  useEffect(() => {
    fetchVideos();
  }, [company.id]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('company_videos')
        .select('*')
        .eq('company_id', company.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setIsLoading(false);
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

  const openAddDialog = () => {
    resetForm();
    setEditingVideo(null);
    setIsAddingVideo(true);
  };

  const openEditDialog = (video: CompanyVideo) => {
    setFormData({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      duration: video.duration || '',
      thumbnailType: video.thumbnail_url ? 'url' : 'auto'
    });
    setEditingVideo(video);
    setIsAddingVideo(true);
  };

  const closeDialog = () => {
    setIsAddingVideo(false);
    setEditingVideo(null);
    resetForm();
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
    // Retornar null para que o usuário possa fazer upload manual
    const loomId = getLoomVideoId(url);
    if (loomId) {
      return null;
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.video_url) {
      toast.error('Título e URL do vídeo são obrigatórios');
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
        title: formData.title,
        description: formData.description || null,
        video_url: formData.video_url,
        thumbnail_url: thumbnailUrl || null,
        duration: formData.duration || null,
        company_id: company.id,
        order_index: editingVideo ? editingVideo.order_index : videos.length
      };

      if (editingVideo) {
        const { error } = await supabase
          .from('company_videos')
          .update(videoData)
          .eq('id', editingVideo.id);

        if (error) throw error;
        toast.success('Vídeo atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('company_videos')
          .insert(videoData);

        if (error) throw error;
        toast.success('Vídeo adicionado com sucesso');
      }

      await fetchVideos();
      closeDialog();
    } catch (error: any) {
      console.error('Error saving video:', error);
      toast.error('Erro ao salvar vídeo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    try {
      const { error } = await supabase
        .from('company_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      
      toast.success('Vídeo excluído com sucesso');
      await fetchVideos();
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast.error('Erro ao excluir vídeo');
    }
  };

  const handleThumbnailUpload = (url: string) => {
    setFormData(prev => ({ ...prev, thumbnail_url: url }));
  };

  const getVideoType = (url: string): 'youtube' | 'loom' | 'unknown' => {
    if (getYoutubeVideoId(url)) return 'youtube';
    if (getLoomVideoId(url)) return 'loom';
    return 'unknown';
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando vídeos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Playlist de Vídeos</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os vídeos da playlist de integração
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Vídeo
        </Button>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum vídeo adicionado ainda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {videos.map((video, index) => (
            <Card key={video.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  {video.thumbnail_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{video.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Posição: {index + 1}</span>
                          {video.duration && <span>Duração: {video.duration}</span>}
                          <span className="capitalize">
                            Tipo: {getVideoType(video.video_url)}
                          </span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openEditDialog(video)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => handleDelete(video.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para adicionar/editar vídeo */}
      <Dialog open={isAddingVideo} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVideo ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Suporte para URLs do YouTube (youtube.com/watch?v=... ou youtu.be/...) 
                e Loom (loom.com/share/...).
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="title">Título do Vídeo</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título do vídeo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=... ou https://www.loom.com/share/..."
                required
              />
              {formData.video_url && !validateVideoUrl(formData.video_url) && (
                <p className="text-red-500 text-sm">URL inválida</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o conteúdo do vídeo..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (Opcional)</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Ex: 5 min, 10:30, etc."
              />
            </div>

            {/* Configuração de Thumbnail */}
            <div className="space-y-4">
              <Label>Thumbnail do Vídeo</Label>
              
              <Tabs 
                value={formData.thumbnailType} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  thumbnailType: value as 'auto' | 'url' | 'upload',
                  thumbnail_url: value === 'auto' ? '' : prev.thumbnail_url
                }))}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="auto">Automático</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
                
                <TabsContent value="auto" className="space-y-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Para vídeos do YouTube, a thumbnail será extraída automaticamente. 
                      Para vídeos do Loom, você precisará fazer upload manual.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-2">
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    placeholder="https://exemplo.com/thumbnail.jpg"
                  />
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-2">
                  <DragDropImageUpload
                    value={formData.thumbnail_url}
                    onChange={handleThumbnailUpload}
                    objectPrefix="video-thumbnails"
                    bucketName="company-assets"
                    storagePath="thumbnails"
                    label="Arraste e solte a thumbnail ou clique para selecionar"
                  />
                </TabsContent>
              </Tabs>

              {/* Preview da thumbnail */}
              {formData.thumbnail_url && (
                <div className="mt-4">
                  <Label>Preview da Thumbnail:</Label>
                  <div className="mt-2">
                    <img
                      src={formData.thumbnail_url}
                      alt="Preview"
                      className="w-32 h-20 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : editingVideo ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
