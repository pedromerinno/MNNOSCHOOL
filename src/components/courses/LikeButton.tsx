import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200",
        userLiked 
          ? "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md" 
          : "hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800"
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all duration-200",
          userLiked ? "fill-white" : "text-red-500"
        )} 
      />
      <span className="font-medium">{likes || 0}</span>
    </Button>
  );
};
