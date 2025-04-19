
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Image as ImageIcon } from "lucide-react";

interface DiscussionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string, imageUrl?: string) => Promise<void>;
}

export const DiscussionForm: React.FC<DiscussionFormProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
}) => {
  const { register, handleSubmit, reset } = useForm();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const onFormSubmit = async (data: any) => {
    await onSubmit(data.title, data.content, imageUrl);
    reset();
    setImageUrl(undefined);
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
