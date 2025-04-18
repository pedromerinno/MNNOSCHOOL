
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  courseId: string;
  initialFavorite: boolean;
  onFavoriteChange?: (isFavorite: boolean) => void;
  className?: string;
  iconOnly?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  courseId,
  initialFavorite,
  onFavoriteChange,
  className,
  iconOnly = true
}) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(initialFavorite);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the parent Link from being activated
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para favoritar um curso",
          variant: "destructive",
        });
        return;
      }
      
      // Check if there's an existing progress record
      const { data: existingProgress } = await supabase
        .from('user_course_progress')
        .select()
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (existingProgress) {
        // Update existing record
        const { error } = await supabase
          .from('user_course_progress')
          .update({ favorite: !isFavorite, last_accessed: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('course_id', courseId);
        
        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_course_progress')
          .insert({
            user_id: user.id,
            course_id: courseId,
            favorite: true,
            progress: 0,
            completed: false,
            last_accessed: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setIsFavorite(!isFavorite);
      
      // Call onFavoriteChange if provided
      if (onFavoriteChange) {
        onFavoriteChange(!isFavorite);
      }
      
      // Show success toast
      toast({
        title: !isFavorite ? "Curso favoritado" : "Curso removido dos favoritos",
        description: !isFavorite ? "O curso foi adicionado aos seus favoritos" : "O curso foi removido dos seus favoritos",
      });
      
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro ao favoritar curso",
        description: error.message || "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (iconOnly) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "rounded-full h-8 w-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm transition-colors",
          isFavorite
            ? "hover:bg-red-100 dark:hover:bg-red-950/30"
            : "hover:bg-white dark:hover:bg-gray-800",
          className
        )}
        onClick={handleToggleFavorite}
        disabled={isSubmitting}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors text-white", // Changed to text-white
            isFavorite
              ? "fill-red-500"
              : ""
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      className={cn(
        "flex items-center gap-2",
        isFavorite && "bg-red-500 hover:bg-red-600",
        className
      )}
      onClick={handleToggleFavorite}
      disabled={isSubmitting}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          isFavorite && "fill-current"
        )}
      />
      {isFavorite ? "Favoritado" : "Favoritar"}
    </Button>
  );
};
