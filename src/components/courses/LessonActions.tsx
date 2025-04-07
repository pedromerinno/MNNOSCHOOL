
import React from 'react';
import { useLessonActions } from '@/hooks/useLessonActions';
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
  const { 
    completed: isCompleted,
    likes: likeCount,
    userLiked: hasUserLiked,
    handleMarkCompleted,
    handleToggleLike
  } = useLessonActions({
    initialCompleted: completed,
    initialLikes: likes,
    initialUserLiked: userLiked,
    onMarkCompleted,
    onToggleLike
  });

  return (
    <div className="flex justify-between items-center my-6">
      <LikeButton 
        likes={likeCount} 
        userLiked={hasUserLiked} 
        onToggleLike={handleToggleLike} 
      />
      
      <CompleteButton 
        completed={isCompleted} 
        onMarkCompleted={handleMarkCompleted} 
      />
    </div>
  );
};
