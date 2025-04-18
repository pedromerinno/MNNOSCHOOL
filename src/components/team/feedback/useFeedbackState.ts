
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Feedback } from "./types";

export const useFeedbackState = (initialFeedbacks: Feedback[]) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartEdit = (feedback: Feedback) => {
    setEditingFeedbackId(feedback.id);
    setEditContent(feedback.content);
  };

  const handleCancelEdit = () => {
    setEditingFeedbackId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (feedbackId: string) => {
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('user_feedbacks')
        .update({ content: editContent })
        .eq('id', feedbackId);

      if (error) throw error;

      setFeedbacks(prev => 
        prev.map(feedback => 
          feedback.id === feedbackId 
            ? { ...feedback, content: editContent } 
            : feedback
        )
      );

      toast.success("Feedback atualizado com sucesso");
      setEditingFeedbackId(null);
    } catch (error) {
      console.error('Erro ao atualizar feedback:', error);
      toast.error("Erro ao atualizar feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('user_feedbacks')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
      
      setFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId));
      toast.success("Feedback excluído com sucesso");
    } catch (error) {
      console.error('Erro ao excluir feedback:', error);
      toast.error("Erro ao excluir feedback");
    }
  };

  return {
    feedbacks,
    editingFeedbackId,
    editContent,
    isSubmitting,
    setEditContent,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDeleteFeedback
  };
};
