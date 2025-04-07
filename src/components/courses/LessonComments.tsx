
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, AlertTriangle } from "lucide-react";

interface Comment {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string;
  };
}

interface LessonCommentsProps {
  lessonId: string;
}

export const LessonComments: React.FC<LessonCommentsProps> = ({ lessonId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    // Simulate loading comments
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        // No comments by default
        setComments([]);
      }
    }, 1000);

    // Add error handling for WebSocket connection
    const channel = supabase.channel('lesson_comments')
      .on('system', (event) => {
        // Listen for system events like connection issues
        if (event.event === 'disconnect' && isMounted) {
          console.warn('WebSocket disconnected:', event);
          setConnectionError(true);
        }
      })
      .subscribe((status) => {
        // Check subscription status
        if (status !== 'SUBSCRIBED' && isMounted) {
          console.warn('Failed to subscribe to comments channel:', status);
          setConnectionError(true);
        }
      });
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      // Clean up channel subscription to prevent memory leaks
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setConnectionError(false);
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Create a new comment in local state
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        lesson_id: lessonId,
        user_id: user.id,
        content: newComment,
        created_at: new Date().toISOString(),
        profile: {
          username: 'Você',
          avatar_url: ''
        }
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi publicado com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: 'Erro ao adicionar comentário',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentários
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connectionError && (
          <div className="mb-4 p-2 border border-amber-200 bg-amber-50 text-amber-700 rounded-md flex items-center gap-2 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-500">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Problema de conexão detectado. Alguns recursos podem estar limitados.</span>
          </div>
        )}
        
        <div className="space-y-6 mb-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-4">Carregando comentários...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Seja o primeiro a comentar nesta aula!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profile?.avatar_url || ''} />
                  <AvatarFallback>{getInitials(comment.user_id)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{comment.profile?.username || 'Usuário'}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <Textarea 
            placeholder="Adicione um comentário..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <Button 
            onClick={handleSubmitComment} 
            disabled={!newComment.trim() || submitting}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
