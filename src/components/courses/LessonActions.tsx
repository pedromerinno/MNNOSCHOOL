
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, ThumbsUp } from "lucide-react";

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
      <Button 
        variant={userLiked ? "default" : "outline"}
        size="sm"
        onClick={onToggleLike}
        className="flex items-center gap-2"
      >
        <ThumbsUp className={`h-4 w-4 ${userLiked ? "fill-current" : ""}`} />
        <span>{likes || 0} {likes === 1 ? 'curtida' : 'curtidas'}</span>
      </Button>
      
      <Button 
        onClick={onMarkCompleted}
        disabled={completed}
        variant={completed ? "outline" : "default"}
        className="flex items-center gap-2"
      >
        <CheckCircle className={`h-4 w-4 ${completed ? "text-green-500" : ""}`} />
        {completed ? "Aula concluída" : "Marcar como concluído"}
      </Button>
    </div>
  );
};
