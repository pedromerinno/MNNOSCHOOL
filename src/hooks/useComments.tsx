
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CommentProfile {
  username: string;
  avatar_url: string;
}

export interface Comment {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  profile?: CommentProfile;
}

interface CommentResponse {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar: string | null;
  };
}

export function useComments(lessonId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch comments
  useEffect(() => {
    let isMounted = true;
    
    const fetchComments = async () => {
      try {
        setLoading(true);
        
        // Use a type assertion to tell TypeScript this is a valid table
        const { data, error } = await supabase
          .from('lesson_comments' as any)
          .select(`
            id, 
            lesson_id, 
            user_id, 
            content, 
            created_at,
            profiles:user_id (
              display_name,
              avatar
            )
          `)
          .eq('lesson_id', lessonId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Format comments with profile data - use double type assertion to handle the unknown data format
        const formattedComments = ((data as unknown) as CommentResponse[] || []).map(comment => ({
          id: comment.id,
          user_id: comment.user_id,
          lesson_id: comment.lesson_id,
          content: comment.content,
          created_at: comment.created_at,
          profile: {
            username: comment.profiles?.display_name || 'Usuário',
            avatar_url: comment.profiles?.avatar || ''
          }
        }));
        
        if (isMounted) {
          setComments(formattedComments);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        if (isMounted) {
          setLoading(false);
          // Set as string if error message is available, otherwise true
          setConnectionError(error instanceof Error ? error.message : true);
        }
      }
    };
    
    fetchComments();

    // Set up realtime subscription for new comments
    const channel = supabase.channel('public:lesson_comments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'lesson_comments',
        filter: `lesson_id=eq.${lessonId}`
      }, async (payload) => {
        // Fetch user data for the new comment
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar')
          .eq('id', payload.new.user_id)
          .single();
          
        const newComment: Comment = {
          id: payload.new.id,
          user_id: payload.new.user_id,
          lesson_id: payload.new.lesson_id,
          content: payload.new.content,
          created_at: payload.new.created_at,
          profile: {
            username: profile?.display_name || 'Usuário',
            avatar_url: profile?.avatar || ''
          }
        };
        
        if (isMounted) {
          setComments(prev => [...prev, newComment]);
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
    
    return () => {
      isMounted = false;
      // Clean up channel subscription to prevent memory leaks
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  // Submit a new comment
  const submitComment = async (content: string) => {
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setConnectionError(false);
      
      // Get current user data
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data?.user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Insert comment into database - use type assertion
      const { error: insertError } = await supabase
        .from('lesson_comments' as any)
        .insert({
          lesson_id: lessonId,
          user_id: data.user.id,
          content: content
        });
        
      if (insertError) throw insertError;
      
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi publicado com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: 'Erro ao adicionar comentário',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    comments,
    loading,
    connectionError,
    submitting,
    submitComment
  };
}
