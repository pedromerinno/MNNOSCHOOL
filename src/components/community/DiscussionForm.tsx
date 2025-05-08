
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageIcon, X, Youtube } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

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
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(title, content, imageUrl, videoUrl);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setImageUrl(undefined);
    setVideoUrl("");
    setShowVideoInput(false);
    onOpenChange(false);
  };

  const renderVideoPreview = () => {
    if (!videoUrl) return null;
    
    let isValid = false;
    
    if (
      videoUrl.includes('youtube.com') || 
      videoUrl.includes('youtu.be') || 
      videoUrl.includes('vimeo.com') || 
      videoUrl.includes('loom.com')
    ) {
      isValid = true;
    }
    
    return (
      <div className="mt-2 text-sm">
        {isValid ? (
          <div className="text-green-600 flex items-center">
            <span className="mr-1">✓</span>  
            {videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? 'Vídeo do YouTube' : 
             videoUrl.includes('vimeo') ? 'Vídeo do Vimeo' : 
             videoUrl.includes('loom') ? 'Vídeo do Loom' : ''}
          </div>
        ) : (
          <div className="text-red-500">
            URL inválida. Use um link do YouTube, Vimeo ou Loom.
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-6 pt-5 pb-4 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Nova Discussão</DialogTitle>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          <div className="space-y-4">
            <div>
              <Input 
                placeholder="Título da discussão" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-medium text-lg"
              />
            </div>
            <div>
              <Textarea 
                placeholder="Sobre o que você quer discutir?" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            
            {imageUrl && (
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-auto max-h-[300px] object-cover rounded-lg"
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
            
            {showVideoInput && (
              <div>
                <Input
                  type="text"
                  placeholder="Cole a URL do vídeo (YouTube, Vimeo ou Loom)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mb-2"
                />
                {renderVideoPreview()}
              </div>
            )}
            
            <div className="flex gap-3">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="hidden" 
                id="image-upload-discussion"
              />
              <label 
                htmlFor="image-upload-discussion" 
                className="cursor-pointer flex items-center text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                Adicionar imagem
              </label>
              
              <Button
                variant={showVideoInput ? "default" : "outline"}
                className="flex items-center gap-2"
                onClick={() => setShowVideoInput(!showVideoInput)}
              >
                <Youtube className="h-5 w-5" />
                {showVideoInput ? "Ocultar" : "Adicionar vídeo"}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t p-4 flex justify-end">
          <Button 
            variant="outline" 
            className="mr-2" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !content.trim() || isSubmitting}
            style={{ backgroundColor: companyColor }}
          >
            {isSubmitting ? "Publicando..." : "Publicar discussão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
