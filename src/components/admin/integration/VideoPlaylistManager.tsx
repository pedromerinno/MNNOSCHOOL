import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Video, Plus, Pencil, Trash2, X, Check, MoveUp, MoveDown, Loader2, FileImage } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
interface VideoPlaylistManagerProps {
  company: Company;
}
interface VideoItem {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  order_index: number;
}
export const VideoPlaylistManager: React.FC<VideoPlaylistManagerProps> = ({
  company
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isExtractingThumbnail, setIsExtractingThumbnail] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const fetchVideos = async () => {
    if (!company || !company.id) return;
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from('company_videos').select('*').eq('company_id', company.id).order('order_index', {
        ascending: true
      });
      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      console.error("Error fetching videos:", error);
      toast.error(`Error loading videos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (company && company.id) {
      console.log(`Loading videos for company: ${company.nome}`);
      fetchVideos();
    }
  }, [company]);
  useEffect(() => {
    const handleCompanyChange = () => {
      console.log("VideoPlaylistManager: Company change event detected");
      resetForm();
      fetchVideos();
    };
    window.addEventListener('settings-company-changed', handleCompanyChange);
    return () => {
      window.removeEventListener('settings-company-changed', handleCompanyChange);
    };
  }, [company]);
  const resetForm = () => {
    setVideoTitle("");
    setVideoDescription("");
    setVideoUrl("");
    setThumbnailUrl("");
    setVideoDuration("");
    setIsExtractingThumbnail(false);
  };
  const extractYouTubeThumbnail = () => {
    if (!videoUrl) {
      toast.error("Please enter a YouTube URL first");
      return;
    }
    setIsExtractingThumbnail(true);
    try {
      const videoId = getYoutubeVideoId(videoUrl);
      if (!videoId) {
        toast.error("Could not extract video ID from URL");
        setIsExtractingThumbnail(false);
        return;
      }
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      setThumbnailUrl(thumbnailUrl);
      toast.success("Thumbnail extracted successfully");
    } catch (error) {
      toast.error("Failed to extract thumbnail");
      console.error("Error extracting thumbnail:", error);
    } finally {
      setIsExtractingThumbnail(false);
    }
  };
  const handleAddVideo = async () => {
    if (!videoTitle || !videoUrl) {
      toast.error("Title and video URL are required");
      return;
    }
    try {
      const maxOrderIndex = videos.length > 0 ? Math.max(...videos.map(v => v.order_index)) + 1 : 0;
      const {
        data,
        error
      } = await supabase.from('company_videos').insert({
        company_id: company.id,
        title: videoTitle,
        description: videoDescription || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        duration: videoDuration || null,
        order_index: maxOrderIndex
      }).select().single();
      if (error) throw error;
      setVideos([...videos, data]);
      resetForm();
      setShowAddDialog(false);
      toast.success("Video added successfully");
    } catch (error: any) {
      console.error("Error adding video:", error);
      toast.error(`Error adding video: ${error.message}`);
    }
  };
  const handleEditVideo = async () => {
    if (!selectedVideo) return;
    if (!videoTitle || !videoUrl) {
      toast.error("Title and video URL are required");
      return;
    }
    try {
      const {
        error
      } = await supabase.from('company_videos').update({
        title: videoTitle,
        description: videoDescription || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        duration: videoDuration || null
      }).eq('id', selectedVideo.id);
      if (error) throw error;
      setVideos(videos.map(video => video.id === selectedVideo.id ? {
        ...video,
        title: videoTitle,
        description: videoDescription,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration: videoDuration
      } : video));
      resetForm();
      setShowEditDialog(false);
      setSelectedVideo(null);
      toast.success("Video updated successfully");
    } catch (error: any) {
      console.error("Error updating video:", error);
      toast.error(`Error updating video: ${error.message}`);
    }
  };
  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    try {
      const {
        error
      } = await supabase.from('company_videos').delete().eq('id', selectedVideo.id);
      if (error) throw error;
      setVideos(videos.filter(video => video.id !== selectedVideo.id));
      setShowDeleteDialog(false);
      setSelectedVideo(null);
      toast.success("Video deleted successfully");
      const updatedVideos = videos.filter(video => video.id !== selectedVideo.id);
      updateVideoOrder(updatedVideos);
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast.error(`Error deleting video: ${error.message}`);
    }
  };
  const openEditDialog = (video: VideoItem) => {
    setSelectedVideo(video);
    setVideoTitle(video.title);
    setVideoDescription(video.description || "");
    setVideoUrl(video.video_url);
    setThumbnailUrl(video.thumbnail_url || "");
    setVideoDuration(video.duration || "");
    setShowEditDialog(true);
  };
  const openDeleteDialog = (video: VideoItem) => {
    setSelectedVideo(video);
    setShowDeleteDialog(true);
  };
  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };
  const updateVideoOrder = async (updatedVideos: VideoItem[]) => {
    const newOrderVideos = updatedVideos.map((video, index) => ({
      ...video,
      order_index: index
    }));
    setVideos(newOrderVideos);
    try {
      for (const video of newOrderVideos) {
        await supabase.from('company_videos').update({
          order_index: video.order_index
        }).eq('id', video.id);
      }
    } catch (error: any) {
      console.error("Error updating video order:", error);
      toast.error(`Error updating video order: ${error.message}`);
      fetchVideos();
    }
  };
  const moveVideoUp = (index: number) => {
    if (index === 0) return;
    const updatedVideos = [...videos];
    const temp = updatedVideos[index];
    updatedVideos[index] = updatedVideos[index - 1];
    updatedVideos[index - 1] = temp;
    updateVideoOrder(updatedVideos);
  };
  const moveVideoDown = (index: number) => {
    if (index === videos.length - 1) return;
    const updatedVideos = [...videos];
    const temp = updatedVideos[index];
    updatedVideos[index] = updatedVideos[index + 1];
    updatedVideos[index + 1] = temp;
    updateVideoOrder(updatedVideos);
  };
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium mb-1">Playlist de Vídeos</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os vídeos exibidos na playlist de integração
          </p>
        </div>
        
        <Button onClick={openAddDialog} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Vídeo
        </Button>
      </div>
      
      {isLoading ? <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            <p className="mt-2 text-gray-500">Carregando vídeos...</p>
          </CardContent>
        </Card> : videos.length === 0 ? <Card>
          <CardContent className="p-6 text-center py-[60px]">
            <Video className="h-12 w-8 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Adicione vídeos à playlist de integração da empresa
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Vídeo
            </Button>
          </CardContent>
        </Card> : <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Vídeo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video, index) => <TableRow key={video.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveVideoUp(index)} disabled={index === 0}>
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveVideoDown(index)} disabled={index === videos.length - 1}>
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <span>{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Ver vídeo
                    </a>
                  </TableCell>
                  <TableCell>{video.duration || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(video)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDeleteDialog(video)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </Card>}
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Adicionar Vídeo</DialogTitle>
            <DialogDescription>
              Adicione um novo vídeo à playlist de integração
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoTitle">Título do Vídeo*</Label>
              <Input id="videoTitle" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Digite o título do vídeo" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo (YouTube)*</Label>
              <Input id="videoUrl" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoDescription">Descrição do Vídeo</Label>
              <Textarea id="videoDescription" value={videoDescription} onChange={e => setVideoDescription(e.target.value)} placeholder="Descreva brevemente o conteúdo do vídeo..." rows={3} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <Label htmlFor="thumbnailUrl">URL da Miniatura (opcional)</Label>
                <Button type="button" size="sm" variant="outline" onClick={extractYouTubeThumbnail} disabled={isExtractingThumbnail || !videoUrl}>
                  {isExtractingThumbnail ? <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extraindo...
                    </> : <>
                      <FileImage className="h-4 w-4 mr-2" />
                      Extrair Thumbnail
                    </>}
                </Button>
              </div>
              <Input id="thumbnailUrl" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://example.com/thumbnail.jpg" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoDuration">Duração do Vídeo (opcional)</Label>
              <Input id="videoDuration" value={videoDuration} onChange={e => setVideoDuration(e.target.value)} placeholder="5:30" />
            </div>
            
            {thumbnailUrl && <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Prévia da Miniatura:</p>
                <img src={thumbnailUrl} alt="Thumbnail preview" className="max-h-48 rounded border border-gray-200 object-cover" onError={e => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Thumbnail+Error';
              toast.error("Erro ao carregar a miniatura");
            }} />
              </div>}
            
            {videoUrl && getYoutubeVideoId(videoUrl) && <div className="aspect-w-16 aspect-h-9">
                <iframe src={`https://www.youtube.com/embed/${getYoutubeVideoId(videoUrl)}`} className="w-full rounded-lg" style={{
              aspectRatio: '16/9'
            }} allowFullScreen frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Video Preview" />
              </div>}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleAddVideo}>
              <Check className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar Vídeo</DialogTitle>
            <DialogDescription>
              Altere as informações do vídeo selecionado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editVideoTitle">Título do Vídeo*</Label>
              <Input id="editVideoTitle" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Digite o título do vídeo" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editVideoUrl">URL do Vídeo (YouTube)*</Label>
              <Input id="editVideoUrl" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editVideoDescription">Descrição do Vídeo</Label>
              <Textarea id="editVideoDescription" value={videoDescription} onChange={e => setVideoDescription(e.target.value)} placeholder="Descreva brevemente o conteúdo do vídeo..." rows={3} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <Label htmlFor="editThumbnailUrl">URL da Miniatura (opcional)</Label>
                <Button type="button" size="sm" variant="outline" onClick={extractYouTubeThumbnail} disabled={isExtractingThumbnail || !videoUrl}>
                  {isExtractingThumbnail ? <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extraindo...
                    </> : <>
                      <FileImage className="h-4 w-4 mr-2" />
                      Extrair Thumbnail
                    </>}
                </Button>
              </div>
              <Input id="editThumbnailUrl" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://example.com/thumbnail.jpg" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editVideoDuration">Duração do Vídeo (opcional)</Label>
              <Input id="editVideoDuration" value={videoDuration} onChange={e => setVideoDuration(e.target.value)} placeholder="5:30" />
            </div>
            
            {thumbnailUrl && <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Prévia da Miniatura:</p>
                <img src={thumbnailUrl} alt="Thumbnail preview" className="max-h-48 rounded border border-gray-200 object-cover" onError={e => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Thumbnail+Error';
              toast.error("Erro ao carregar a miniatura");
            }} />
              </div>}
            
            {videoUrl && getYoutubeVideoId(videoUrl) && <div className="aspect-w-16 aspect-h-9">
                <iframe src={`https://www.youtube.com/embed/${getYoutubeVideoId(videoUrl)}`} className="w-full rounded-lg" style={{
              aspectRatio: '16/9'
            }} allowFullScreen frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Video Preview" />
              </div>}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleEditVideo}>
              <Check className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Vídeo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o vídeo "{selectedVideo?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteVideo}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};