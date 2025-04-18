
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Feedback } from "./types";
import { FeedbackEditForm } from "./FeedbackEditForm";
import { useState } from "react";

interface FeedbackItemProps {
  feedback: Feedback;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, content: string) => Promise<void>;
}

export const FeedbackItem = ({ feedback, onDelete, onUpdate }: FeedbackItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleStartEdit = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveEdit = async (content: string) => {
    await onUpdate(feedback.id, content);
    setIsEditing(false);
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
            <DropdownMenuItem onClick={handleStartEdit}>
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
      
      {isEditing ? (
        <FeedbackEditForm
          initialContent={feedback.content}
          onCancel={handleCancelEdit}
          onSave={handleSaveEdit}
        />
      ) : (
        <p className="text-gray-700 dark:text-gray-300 pl-11">{feedback.content}</p>
      )}
    </div>
  );
};
