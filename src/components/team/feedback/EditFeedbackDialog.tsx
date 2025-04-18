
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: {
    id: string;
    content: string;
  } | null;
}

export const EditFeedbackDialog = ({ isOpen, onClose, feedback }: EditFeedbackDialogProps) => {
  const [content, setContent] = useState(feedback?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback || !content.trim()) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('user_feedbacks')
        .update({ content })
        .eq('id', feedback.id);

      if (error) throw error;

      toast.success("Feedback atualizado com sucesso");
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar feedback:', error);
      toast.error("Erro ao atualizar feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite seu feedback..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim() || isSubmitting}
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
