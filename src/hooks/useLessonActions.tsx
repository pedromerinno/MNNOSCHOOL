
import { useState } from 'react';

interface UseLessonActionsProps {
  initialCompleted: boolean;
  initialLikes: number;
  initialUserLiked: boolean;
  onMarkCompleted: () => void;
  onToggleLike: () => void;
}

export const useLessonActions = ({
  initialCompleted,
  initialLikes,
  initialUserLiked,
  onMarkCompleted,
  onToggleLike
}: UseLessonActionsProps) => {
  const [completed, setCompleted] = useState(initialCompleted);
  const [likes, setLikes] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(initialUserLiked);

  const handleMarkCompleted = () => {
    if (!completed) {
      setCompleted(true);
      onMarkCompleted();
    }
  };

  const handleToggleLike = () => {
    setUserLiked(!userLiked);
    setLikes(userLiked ? likes - 1 : likes + 1);
    onToggleLike();
  };

  return {
    completed,
    likes,
    userLiked,
    handleMarkCompleted,
    handleToggleLike
  };
};
