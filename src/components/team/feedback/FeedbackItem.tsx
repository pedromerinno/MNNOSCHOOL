
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Feedback } from "./types";
import { formatDistanceToNow } from 'date-fns';

interface FeedbackItemProps {
  feedback: Feedback;
  editingFeedbackId: string | null;
  editContent: string;
  isSubmitting: boolean;
  onEditContentChange: (content: string) => void;
  onStartEdit: (feedback: Feedback) => void;
  onCancelEdit: () => void;
  onSaveEdit: (feedbackId: string) => void;
  onDelete: (feedbackId: string) => void;
}

export const FeedbackItem = ({
  feedback,
  editingFeedbackId,
  editContent,
  isSubmitting,
  onEditContentChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete
}: FeedbackItemProps) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'recently';
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
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
              {formatDate(feedback.created_at)}
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
            <DropdownMenuItem onClick={() => onStartEdit(feedback)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400"
              onClick={() => onDelete(feedback.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {editingFeedbackId === feedback.id ? (
        <div className="pl-11 space-y-2">
          <Textarea 
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className="min-h-[100px] w-full"
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCancelEdit}
            >
              Cancelar
            </Button>
            <Button 
              size="sm"
              onClick={() => onSaveEdit(feedback.id)}
              disabled={!editContent.trim() || isSubmitting}
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 pl-11">{feedback.content}</p>
      )}
    </div>
  );
};
