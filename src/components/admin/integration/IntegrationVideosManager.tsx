
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Plus, Video, Trash2, PlusCircle, Edit, Link, ExternalLink } from "lucide-react";
import { Company } from "@/types/company";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const videoFormSchema = z.object({
  video_institucional: z.string().url("URL inválida").or(z.string().length(0)).nullable(),
  descricao_video: z.string().max(1000, "Descrição muito longa").nullable(),
});

// Schema for playlist videos
const playlistVideoSchema = z.object({
  url: z.string().url("URL inválida").min(1, "URL é obrigatória"),
  title: z.string().min(1, "Título é obrigatório").max(100, "Título muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  order: z.number().int().default(0),
});

type PlaylistVideo = z.infer<typeof playlistVideoSchema>;

interface IntegrationVideosManagerProps {
  company: Company;
}

export const IntegrationVideosManager: React.FC<IntegrationVideosManagerProps> = ({
  company
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<PlaylistVideo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof videoFormSchema>>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      video_institucional: company.video_institucional || "",
      descricao_video: company.descricao_video || "",
    },
  });

  const playlistForm = useForm<PlaylistVideo>({
    resolver: zodResolver(playlistVideoSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
      order: 0,
    },
  });

  // Load company data when it changes
  useEffect(() => {
    form.reset({
      video_institucional: company.video_institucional || "",
      descricao_video: company.descricao_video || "",
    });
    
    // Fetch playlist videos
    fetchPlaylistVideos();
  }, [company, form]);

  // Fetch videos from the playlist
  const fetchPlaylistVideos = async () => {
    if (!company?.id) return;
    
    setIsLoadingPlaylist(true);
    
    try {
      // For now we'll simulate this with a mock - this would be a real DB query
      // In a real implementation, we would fetch from a videos table with company_id foreign key
      setTimeout(() => {
        // Mock data for development
        const mockVideos: PlaylistVideo[] = [
          {
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            title: "Boas-vindas à Empresa",
            description: "Vídeo de boas-vindas para novos funcionários",
            order: 1,
          },
          {
            url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
            title: "Nossos Processos",
            description: "Visão geral dos processos internos",
            order: 2,
          },
        ];
        setPlaylistVideos(mockVideos);
        setIsLoadingPlaylist(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao buscar vídeos da playlist:", error);
      toast.error("Não foi possível carregar os vídeos da playlist");
      setIsLoadingPlaylist(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof videoFormSchema>) => {
    setIsSaving(true);
    
    try {
      // Atualizar informações de vídeo da empresa
      const { error } = await supabase
        .from('empresas')
        .update({
          video_institucional: data.video_institucional,
          descricao_video: data.descricao_video,
        })
        .eq('id', company.id);
        
      if (error) throw error;
      
      toast.success("Vídeo de integração atualizado com sucesso");
      
      // Disparar evento para atualizar dados da empresa em outros componentes
      window.dispatchEvent(new Event('company-relation-changed'));
      
    } catch (error: any) {
      console.error("Erro ao salvar vídeo:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVideo = (data: PlaylistVideo) => {
    // In a real implementation, this would save to the database
    // For now, we'll just update the local state
    
    if (currentVideo) {
      // Edit existing video
      setPlaylistVideos(prev => 
        prev.map(v => v.url === currentVideo.url ? { ...data } : v)
      );
      toast.success("Vídeo atualizado com sucesso");
    } else {
      // Add new video
      setPlaylistVideos(prev => [...prev, { ...data, order: prev.length + 1 }]);
      toast.success("Vídeo adicionado com sucesso");
    }
    
    // Reset form and close dialog
    playlistForm.reset();
    setCurrentVideo(null);
    setIsDialogOpen(false);
  };

  const handleRemoveVideo = (video: PlaylistVideo) => {
    // In a real implementation, this would delete from the database
    setPlaylistVideos(prev => prev.filter(v => v.url !== video.url));
    toast.success("Vídeo removido com sucesso");
  };

  const handleEditVideo = (video: PlaylistVideo) => {
    setCurrentVideo(video);
    playlistForm.reset({
      url: video.url,
      title: video.title,
      description: video.description || "",
      order: video.order,
    });
    setIsDialogOpen(true);
  };

  // Função para extrair thumbnail do vídeo do YouTube
  const getYouTubeThumbnail = (url: string | null): string => {
    if (!url) return 'https://placehold.co/600x400/eee/ccc?text=Nenhum+vídeo';
    
    try {
      // Extrair ID do vídeo do YouTube (funciona com diversos formatos de URL)
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1].split('?')[0];
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    } catch (e) {
      console.error('Erro ao processar URL do vídeo:', e);
    }
    
    return 'https://placehold.co/600x400/eee/ccc?text=Formato+inválido';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-medium">Vídeo Institucional</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Este vídeo será exibido como destaque na seção de integração
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <img 
                  src={getYouTubeThumbnail(company.video_institucional)} 
                  alt="Thumbnail do vídeo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="video_institucional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Vídeo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.youtube.com/watch?v=..." 
                            {...field}
                            value={field.value || ""} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="descricao_video"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do Vídeo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição do vídeo institucional"
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Vídeo
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Vídeos da Playlist</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerencie os vídeos adicionais que aparecerão na playlist de integração
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => {
                  setCurrentVideo(null);
                  playlistForm.reset({
                    url: "",
                    title: "",
                    description: "",
                    order: playlistVideos.length + 1
                  });
                }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Vídeo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>
                    {currentVideo ? "Editar Vídeo" : "Adicionar Vídeo à Playlist"}
                  </DialogTitle>
                  <DialogDescription>
                    {currentVideo 
                      ? "Modifique as informações do vídeo abaixo."
                      : "Insira as informações do vídeo que será adicionado à playlist."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...playlistForm}>
                  <form onSubmit={playlistForm.handleSubmit(handleAddVideo)} className="space-y-4">
                    <FormField
                      control={playlistForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Vídeo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://www.youtube.com/watch?v=..." 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={playlistForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Título do vídeo" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={playlistForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Breve descrição do conteúdo do vídeo"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        {currentVideo ? "Atualizar Vídeo" : "Adicionar Vídeo"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPlaylist ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : playlistVideos.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {playlistVideos.map((video, index) => (
                  <div 
                    key={`${video.url}-${index}`}
                    className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-shrink-0 w-32 h-20 overflow-hidden rounded">
                      <img 
                        src={getYouTubeThumbnail(video.url)} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{video.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {video.description || "Sem descrição"}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Link className="h-3 w-3 mr-1" />
                        <span className="truncate">{video.url}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditVideo(video)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveVideo(video)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Remover</span>
                      </Button>
                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Abrir</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 text-center border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800">
              <Video className="mx-auto h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Sem vídeos na playlist</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Adicione vídeos à playlist para que os novos funcionários possam assistir durante a integração.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Vídeo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
