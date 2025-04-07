
import React from 'react';
import { CommentItem } from './CommentItem';
import { Comment } from '@/hooks/useComments';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, loading }) => {
  if (loading) {
    return <p className="text-center text-muted-foreground py-4">Carregando comentários...</p>;
  }
  
  if (comments.length === 0) {
    return <p className="text-center text-muted-foreground py-4">Seja o primeiro a comentar nesta aula!</p>;
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};
