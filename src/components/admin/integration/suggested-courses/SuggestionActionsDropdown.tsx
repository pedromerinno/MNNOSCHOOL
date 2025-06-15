
import React from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SuggestedCourse {
  id: string;
  course_id: string;
  user_id: string;
  suggested_by: string;
  reason: string;
  created_at: string;
  company_id: string;
  course: {
    title: string;
    instructor?: string;
    image_url?: string;
  };
  user: {
    display_name: string;
    email: string;
    avatar?: string;
  };
  suggested_by_profile: {
    display_name: string;
  };
  company: {
    nome: string;
  };
}

interface SuggestionActionsDropdownProps {
  suggestion: SuggestedCourse;
  onEdit: (suggestion: SuggestedCourse) => void;
  onDelete: (suggestion: SuggestedCourse) => void;
}

export const SuggestionActionsDropdown: React.FC<SuggestionActionsDropdownProps> = ({
  suggestion,
  onEdit,
  onDelete
}) => {
  const handleEdit = () => {
    onEdit(suggestion);
  };

  const handleDelete = () => {
    onDelete(suggestion);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
