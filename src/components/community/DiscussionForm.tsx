
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Image as ImageIcon, Video } from "lucide-react";

interface DiscussionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string, imageUrl?: string, videoUrl?: string) => Promise<void>;
}

export const DiscussionForm: React.FC<DiscussionFormProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
}) => {
  const { register, handleSubmit, reset } = useForm();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [videoError, setVideoError] = useState<string | null>(null);

  const onFormSubmit = async (data: any) => {
    await onSubmit(data.title, data.content, imageUrl, videoUrl);
    reset();
    setImageUrl(undefined);
    setVideoUrl(undefined);
    setVideoError(null);
    onOpenChange(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateVideoUrl = (url: string): boolean => {
    // Check if URL is from YouTube, Vimeo, or Loom
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com\/|player\.vimeo\.com\/video\/)[0-9]+/;
    const loomRegex = /^(https?:\/\/)?(www\.)?(loom\.com\/share\/)[a-zA-Z0-9]+/;
    
    return youtubeRegex.test(url) || vimeoRegex.test(url) || loomRegex.test(url);
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    
    if (url && !validateVideoUrl(url)) {
      setVideoError("URL inválida. Por favor, insira um link do YouTube, Vimeo ou Loom.");
    } else {
      setVideoError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar nova discussão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Título da discussão
            </label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="Ex: Dicas para novos integrantes"
            />
          </div>
          <div>
            <label htmlFor="content" className="text-sm font-medium">
              Conteúdo
            </label>
            <Textarea
              id="content"
              {...register("content", { required: true })}
              rows={5}
              placeholder="Descreva sua discussão com detalhes..."
            />
          </div>
          {imageUrl && (
            <div className="relative">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setImageUrl(undefined)}
              >
                Remover
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="hidden" 
                id="image-upload"
              />
              <label 
                htmlFor="image-upload" 
                className="cursor-pointer flex items-center text-gray-500 hover:text-gray-700"
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                Adicionar imagem
              </label>
            </div>
            
            <div className="pt-2">
              <label 
                htmlFor="video-url" 
                className="flex items-center text-gray-500 mb-2"
              >
                <Video className="h-5 w-5 mr-2" />
                Link do vídeo (YouTube, Vimeo ou Loom)
              </label>
              <Input
                id="video-url"
                value={videoUrl || ''}
                onChange={handleVideoUrlChange}
                placeholder="Ex: https://youtube.com/watch?v=..."
              />
              {videoError && (
                <p className="text-sm text-red-500 mt-1">{videoError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={videoUrl ? videoError !== null : false}>Criar discussão</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
