
import React from 'react';
import { CommentItem } from './CommentItem';
import { Comment } from '@/hooks/useComments';
import { MessageSquare } from 'lucide-react';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 text-muted-foreground">
        <div className="animate-pulse">Carregando comentários...</div>
      </div>
    );
  }
  
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <MessageSquare className="h-10 w-10 mb-3 text-muted-foreground/50" />
        <p>Seja o primeiro a comentar nesta aula!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};
