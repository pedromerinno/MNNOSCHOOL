
import React from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";

interface LikeButtonProps {
  likes: number;
  userLiked: boolean;
  onToggleLike: () => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  likes,
  userLiked,
  onToggleLike
}) => {
  return (
    <Button 
      variant={userLiked ? "default" : "outline"}
      size="sm"
      onClick={onToggleLike}
      className="flex items-center gap-2"
    >
      <ThumbsUp className={`h-4 w-4 ${userLiked ? "fill-current" : ""}`} />
      <span>{likes || 0} {likes === 1 ? 'curtida' : 'curtidas'}</span>
    </Button>
  );
};
