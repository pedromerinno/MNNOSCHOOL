import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Video, Plus, Edit, Trash2, ArrowUp, ArrowDown, X, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

interface CompanyVideo {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  duration: string | null;
  order_index: number;
}

interface VideoPlaylistManagerProps {
  company: Company;
}

export const VideoPlaylistManager: React.FC<VideoPlaylistManagerProps> = ({ company }) => {
  const [videos, setVideos] = useState<CompanyVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<CompanyVideo | null>(null);
  const [newVideo, setNewVideo] = useState<Partial<CompanyVideo> | null>(null);
  
  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_videos')
        .select('*')
        .eq('company_id', company.id)
        .order('order_index');
        
      if (error) throw error;
      
      setVideos(data || []);
    } catch (error: any) {
      console.error("Error fetching company videos:", error);
      toast.error(`Erro ao carregar vídeos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (company) {
      fetchVideos();
    }
  }, [company]);
  
  const handleAddVideo = () => {
    setNewVideo({
      title: '',
      description: '',
      thumbnail_url: '',
      video_url: '',
      duration: '',
      order_index: videos.length
    });
  };
  
  const handleEditVideo = (video: CompanyVideo) => {
    setEditingVideo(video);
  };
  
  const handleCancelEdit = () => {
    setEditingVideo(null);
    setNewVideo(null);
  };
  
  const handleSaveVideo = async (video: Partial<CompanyVideo>, isNew: boolean) => {
    try {
      if (!video.title || !video.video_url) {
        toast.error("Título e URL do vídeo são obrigatórios");
        return;
      }
      
      if (isNew) {
        const { data, error } = await supabase
          .from('company_videos')
          .insert({
            company_id: company.id,
            title: video.title,
            description: video.description || null,
            thumbnail_url: video.thumbnail_url || null,
            video_url: video.video_url,
            duration: video.duration || null,
            order_index: video.order_index
          })
          .select();
          
        if (error) throw error;
        
        toast.success("Vídeo adicionado com sucesso");
      } else if (video.id) {
        const { error } = await supabase
          .from('company_videos')
          .update({
            title: video.title,
            description: video.description || null,
            thumbnail_url: video.thumbnail_url || null,
            video_url: video.video_url,
            duration: video.duration || null
          })
          .eq('id', video.id);
          
        if (error) throw error;
        
        toast.success("Vídeo atualizado com sucesso");
      }
      
      setEditingVideo(null);
      setNewVideo(null);
      fetchVideos();
      
    } catch (error: any) {
      console.error("Error saving video:", error);
      toast.error(`Erro ao salvar vídeo: ${error.message}`);
    }
  };
  
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo?")) return;
    
    try {
      const { error } = await supabase
        .from('company_videos')
        .delete()
        .eq('id', videoId);
        
      if (error) throw error;
      
      toast.success("Vídeo excluído com sucesso");
      fetchVideos();
      
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast.error(`Erro ao excluir vídeo: ${error.message}`);
    }
  };
  
  const handleMoveVideo = async (videoId: string, direction: 'up' | 'down') => {
    const videoIndex = videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) return;
    
    const newVideos = [...videos];
    const targetIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newVideos.length) return;
    
    // Swap the order_index values
    const temp = newVideos[videoIndex].order_index;
    newVideos[videoIndex].order_index = newVideos[targetIndex].order_index;
    newVideos[targetIndex].order_index = temp;
    
    // Swap the positions in the array
    [newVideos[videoIndex], newVideos[targetIndex]] = [newVideos[targetIndex], newVideos[videoIndex]];
    
    setVideos(newVideos);
    
    try {
      // Update first video
      await supabase
        .from('company_videos')
        .update({ order_index: newVideos[videoIndex].order_index })
        .eq('id', newVideos[videoIndex].id);
        
      // Update second video
      await supabase
        .from('company_videos')
        .update({ order_index: newVideos[targetIndex].order_index })
        .eq('id', newVideos[targetIndex].id);
        
    } catch (error: any) {
      console.error("Error reordering videos:", error);
      toast.error(`Erro ao reordenar vídeos: ${error.message}`);
      fetchVideos(); // Revert to original order
    }
  };
  
  const getYouTubeThumbnail = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
    return null;
  };
  
  const handleUpdateThumbnail = (video: Partial<CompanyVideo>) => {
    if (video.video_url) {
      const thumbnailUrl = getYouTubeThumbnail(video.video_url);
      if (thumbnailUrl) {
        if (editingVideo) {
          setEditingVideo({...editingVideo, thumbnail_url: thumbnailUrl});
        } else if (newVideo) {
          setNewVideo({...newVideo, thumbnail_url: thumbnailUrl});
        }
      }
    }
  };
  
  const VideoForm = ({ video, isNew, onSave, onCancel }: { 
    video: Partial<CompanyVideo>, 
    isNew: boolean,
    onSave: () => void,
    onCancel: () => void 
  }) => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={isNew ? "new-title" : `edit-title-${video.id}`}>Título do Vídeo*</Label>
              <Input 
                id={isNew ? "new-title" : `edit-title-${video.id}`}
                value={video.title || ''} 
                onChange={e => isNew 
                  ? setNewVideo({...newVideo!, title: e.target.value})
                  : setEditingVideo({...editingVideo!, title: e.target.value})
                }
                placeholder="Título do vídeo"
              />
            </div>
            
            <div>
              <Label htmlFor={isNew ? "new-duration" : `edit-duration-${video.id}`}>Duração</Label>
              <Input 
                id={isNew ? "new-duration" : `edit-duration-${video.id}`}
                value={video.duration || ''} 
                onChange={e => isNew
                  ? setNewVideo({...newVideo!, duration: e.target.value})
                  : setEditingVideo({...editingVideo!, duration: e.target.value})
                }
                placeholder="Ex: 5:30"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor={isNew ? "new-video-url" : `edit-video-url-${video.id}`}>URL do Vídeo (YouTube)*</Label>
            <div className="flex gap-2">
              <Input 
                id={isNew ? "new-video-url" : `edit-video-url-${video.id}`}
                value={video.video_url || ''} 
                onChange={e => isNew
                  ? setNewVideo({...newVideo!, video_url: e.target.value})
                  : setEditingVideo({...editingVideo!, video_url: e.target.value})
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleUpdateThumbnail(video)}
                title="Extrair thumbnail do YouTube"
              >
                Extrair Thumbnail
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor={isNew ? "new-thumbnail-url" : `edit-thumbnail-url-${video.id}`}>URL da Miniatura</Label>
            <Input 
              id={isNew ? "new-thumbnail-url" : `edit-thumbnail-url-${video.id}`}
              value={video.thumbnail_url || ''} 
              onChange={e => isNew
                ? setNewVideo({...newVideo!, thumbnail_url: e.target.value})
                : setEditingVideo({...editingVideo!, thumbnail_url: e.target.value})
              }
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {video.thumbnail_url && (
              <div className="mt-2">
                <img 
                  src={video.thumbnail_url} 
                  alt="Miniatura" 
                  className="h-20 object-cover rounded" 
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor={isNew ? "new-description" : `edit-description-${video.id}`}>Descrição</Label>
            <Textarea 
              id={isNew ? "new-description" : `edit-description-${video.id}`}
              value={video.description || ''} 
              onChange={e => isNew
                ? setNewVideo({...newVideo!, description: e.target.value})
                : setEditingVideo({...editingVideo!, description: e.target.value})
              }
              placeholder="Descrição do vídeo..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium mb-1">Vídeos de Integração</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie a playlist de vídeos para o processo de integração
          </p>
        </div>
        
        {!newVideo && !editingVideo && (
          <Button onClick={handleAddVideo}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vídeo
          </Button>
        )}
      </div>
      
      {newVideo && (
        <VideoForm 
          video={newVideo} 
          isNew={true}
          onSave={() => handleSaveVideo(newVideo, true)}
          onCancel={handleCancelEdit}
        />
      )}
      
      {editingVideo && (
        <VideoForm 
          video={editingVideo} 
          isNew={false}
          onSave={() => handleSaveVideo(editingVideo, false)}
          onCancel={handleCancelEdit}
        />
      )}
      
      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando vídeos...</p>
          </CardContent>
        </Card>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum vídeo adicionado</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Adicione vídeos à playlist de integração para os colaboradores
            </p>
            {!newVideo && (
              <Button onClick={handleAddVideo}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Vídeo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Ordem</TableHead>
                <TableHead className="w-16">Miniatura</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveVideo(video.id, 'up')}
                        disabled={video.order_index === 0}
                        className="h-6 w-6"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span>{video.order_index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveVideo(video.id, 'down')}
                        disabled={video.order_index === videos.length - 1}
                        className="h-6 w-6"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-16 h-9 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-9 bg-gray-200 flex items-center justify-center rounded">
                        <Video className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{video.title}</p>
                      {video.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{video.duration || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditVideo(video)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};
