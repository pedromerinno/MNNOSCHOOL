
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditFeedbackDialog } from "./EditFeedbackDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackProfile {
  id: string;
  display_name: string | null;
  avatar: string | null;
}

interface Feedback {
  id: string;
  content: string;
  created_at: string;
  from_user_id: string;
  from_profile?: FeedbackProfile | null;
}

interface FeedbackListProps {
  feedbacks: Feedback[];
}

export const FeedbackList = ({ feedbacks }: FeedbackListProps) => {
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('user_feedbacks')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
      
      toast.success("Feedback excluído com sucesso");
    } catch (error) {
      console.error('Erro ao excluir feedback:', error);
      toast.error("Erro ao excluir feedback");
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
              <div key={feedback.id} className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {feedback.from_profile?.display_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                      {feedback.from_profile?.avatar && (
                        <AvatarImage src={feedback.from_profile.avatar} alt={feedback.from_profile.display_name || ''} />
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{feedback.from_profile?.display_name || 'Usuário Desconhecido'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(feedback.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingFeedback(feedback);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400"
                        onClick={() => handleDeleteFeedback(feedback.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-gray-700 dark:text-gray-300 pl-11">{feedback.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <EditFeedbackDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingFeedback(null);
        }}
        feedback={editingFeedback}
      />
    </Card>
  );
};
