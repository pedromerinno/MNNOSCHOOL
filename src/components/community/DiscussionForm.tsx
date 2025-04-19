
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";

interface DiscussionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string) => Promise<void>;
}

export const DiscussionForm: React.FC<DiscussionFormProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
}) => {
  const { register, handleSubmit, reset } = useForm();

  const onFormSubmit = async (data: any) => {
    await onSubmit(data.title, data.content);
    reset();
    onOpenChange(false);
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
