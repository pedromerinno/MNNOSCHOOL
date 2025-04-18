
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackItem } from "./FeedbackItem";
import { Feedback } from "./types";

interface FeedbackListProps {
  feedbacks: Feedback[];
}

export const FeedbackList = ({ feedbacks: initialFeedbacks }: FeedbackListProps) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);

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

  const handleUpdateFeedback = async (feedbackId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('user_feedbacks')
        .update({ content })
        .eq('id', feedbackId);

      if (error) throw error;

      setFeedbacks(prev => 
        prev.map(feedback => 
          feedback.id === feedbackId 
            ? { ...feedback, content } 
            : feedback
        )
      );

      toast.success("Feedback atualizado com sucesso");
    } catch (error) {
      console.error('Erro ao atualizar feedback:', error);
      toast.error("Erro ao atualizar feedback");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedbacks Recebidos</CardTitle>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum feedback recebido ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbacks.map((feedback) => (
              <FeedbackItem
                key={feedback.id}
                feedback={feedback}
                onDelete={handleDeleteFeedback}
                onUpdate={handleUpdateFeedback}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
