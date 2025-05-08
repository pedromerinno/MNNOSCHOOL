
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from '@/hooks/useComments';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 border">
        <AvatarImage src={comment.profile?.avatar_url || ''} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {getInitials(comment.profile?.username || 'User')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{comment.profile?.username || 'Usuário'}</p>
          <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
};
