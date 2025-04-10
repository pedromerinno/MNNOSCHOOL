
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCourseCardFavorite = (id: string, initialFavorite: boolean = false) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(initialFavorite);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the Link from being activated
    
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
        .eq('course_id', id)
        .maybeSingle();
      
      if (existingProgress) {
        // Update existing record
        const { error } = await supabase
          .from('user_course_progress')
          .update({ favorite: !isFavorite, last_accessed: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('course_id', id);
        
        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_course_progress')
          .insert({
            user_id: user.id,
            course_id: id,
            favorite: true,
            progress: 0,
            completed: false,
            last_accessed: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setIsFavorite(!isFavorite);
      
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

  return {
    isFavorite,
    isSubmitting,
    handleToggleFavorite
  };
};
