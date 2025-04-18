
import React from 'react';
import { LikeButton } from './LikeButton';
import { CompleteButton } from './CompleteButton';

interface LessonActionsProps {
  completed: boolean;
  onMarkCompleted: () => void;
  likes: number;
  userLiked: boolean;
  onToggleLike: () => void;
}

export const LessonActions: React.FC<LessonActionsProps> = ({
  completed,
  onMarkCompleted,
  likes,
  userLiked,
  onToggleLike
}) => {
  return (
    <div className="flex justify-between items-center my-6">
      <LikeButton 
        likes={likes} 
        userLiked={userLiked} 
        onToggleLike={onToggleLike} 
      />
      
      <CompleteButton 
        completed={completed} 
        onMarkCompleted={onMarkCompleted} 
      />
    </div>
  );
};
