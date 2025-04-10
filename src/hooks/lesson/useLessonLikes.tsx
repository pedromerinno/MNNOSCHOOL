
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLessonLikes = (initialLikes: number = 0, initialUserLiked: boolean = false) => {
  const [likes, setLikes] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(initialUserLiked);
  const { toast } = useToast();

  const toggleLikeLesson = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      // Toggle the like state
      if (userLiked) {
        setLikes(prev => Math.max(0, prev - 1));
        setUserLiked(false);
        
        toast({
          title: 'Like removido',
          description: 'Você removeu seu like desta aula',
        });
      } else {
        setLikes(prev => prev + 1);
        setUserLiked(true);
        
        toast({
          title: 'Aula curtida!',
          description: 'Obrigado pelo seu feedback',
        });
      }
    } catch (error: any) {
      console.error('Erro ao curtir/descurtir aula:', error);
      toast({
        title: 'Erro ao processar sua ação',
        description: error.message || 'Ocorreu um erro ao curtir/descurtir a aula',
        variant: 'destructive',
      });
    }
  };

  return { likes, userLiked, toggleLikeLesson };
};
