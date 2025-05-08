
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Image as ImageIcon, Video } from "lucide-react";
import { getEmbedUrl } from "@/components/integration/video-playlist/utils";

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
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoInputValue, setVideoInputValue] = useState("");

  const onFormSubmit = async (data: any) => {
    await onSubmit(data.title, data.content, imageUrl, videoUrl);
    reset();
    setImageUrl(undefined);
    setVideoUrl(undefined);
    setVideoInputValue("");
    setShowVideoInput(false);
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

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoInputValue(e.target.value);
  };

  const addVideoUrl = () => {
    if (videoInputValue.trim()) {
      setVideoUrl(videoInputValue);
      setShowVideoInput(false);
    }
  };

  const isYoutubeUrl = videoUrl && (
    videoUrl.includes("youtube.com") || 
    videoUrl.includes("youtu.be") || 
    videoUrl.includes("youtube-nocookie.com")
  );
  
  const isLoomUrl = videoUrl && (
    videoUrl.includes("loom.com")
  );
  
  const isVimeoUrl = videoUrl && (
    videoUrl.includes("vimeo.com")
  );

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
          
          {videoUrl && (
            <div className="relative">
              <iframe
                src={getEmbedUrl(videoUrl)}
                className="w-full h-64 rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setVideoUrl(undefined)}
              >
                Remover
              </Button>
              <div className="mt-2 text-sm text-gray-500">
                {isYoutubeUrl && "YouTube"}
                {isLoomUrl && "Loom"}
                {isVimeoUrl && "Vimeo"}
                {!isYoutubeUrl && !isLoomUrl && !isVimeoUrl && "Vídeo"}
                : {videoUrl}
              </div>
            </div>
          )}
          
          {showVideoInput && (
            <div className="flex gap-2">
              <Input
                value={videoInputValue}
                onChange={handleVideoUrlChange}
                placeholder="Cole a URL do vídeo (YouTube, Vimeo ou Loom)"
                className="flex-1"
              />
              <Button type="button" onClick={addVideoUrl}>
                Adicionar
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowVideoInput(false)}>
                Cancelar
              </Button>
            </div>
          )}
          
          <div className="flex gap-4">
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
            
            {!videoUrl && !showVideoInput && (
              <div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex items-center text-gray-500 hover:text-gray-700 p-0"
                  onClick={() => setShowVideoInput(true)}
                >
                  <Video className="h-5 w-5 mr-2" />
                  Adicionar vídeo
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar discussão</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
