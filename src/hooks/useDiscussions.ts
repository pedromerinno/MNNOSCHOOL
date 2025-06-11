import { useEffect, useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from "sonner";
import { Discussion, DiscussionReply } from '@/types/discussions';
import { useAuth } from '@/contexts/AuthContext';

export const useDiscussions = () => {
  const { selectedCompany } = useCompanies();
  const { user, userProfile } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscussions = useCallback(async () => {
    if (!selectedCompany?.id) {
      setDiscussions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Single optimized query with joins to get all data at once
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles:author_id(id, display_name, avatar),
          discussion_replies(
            *,
            profiles:author_id(id, display_name, avatar)
          )
        `)
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (discussionsError) throw discussionsError;
      
      if (!discussionsData || discussionsData.length === 0) {
        setDiscussions([]);
        return;
      }
      
      // Transform data to match expected structure
      const formattedData = discussionsData.map(discussion => ({
        id: discussion.id,
        title: discussion.title,
        content: discussion.content,
        author_id: discussion.author_id,
        company_id: discussion.company_id,
        created_at: discussion.created_at,
        updated_at: discussion.updated_at,
        image_url: discussion.image_url || null,
        video_url: discussion.video_url || null,
        status: (discussion.status || 'open') as 'open' | 'closed',
        profiles: Array.isArray(discussion.profiles) && discussion.profiles.length > 0 
          ? discussion.profiles[0] 
          : { display_name: 'Usuário', avatar: null },
        discussion_replies: (discussion.discussion_replies || []).map((reply: any) => ({
          ...reply,
          profiles: Array.isArray(reply.profiles) && reply.profiles.length > 0
            ? reply.profiles[0]
            : { display_name: 'Usuário', avatar: null }
        })) as DiscussionReply[]
      })) as Discussion[];
      
      setDiscussions(formattedData);
    } catch (error: any) {
      console.error('Error fetching discussions:', error);
      toast.error('Erro ao carregar discussões');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany?.id]);

  const createDiscussion = useCallback(async (title: string, content: string, imageUrl?: string, videoUrl?: string) => {
    if (!selectedCompany?.id || !user?.id) {
      toast.error('Nenhuma empresa selecionada');
      return;
    }

    try {
      const discussionData = {
        title,
        content,
        company_id: selectedCompany.id,
        author_id: user.id,
        image_url: imageUrl || null,
        video_url: videoUrl || null,
        status: 'open' as const
      };

      const { data, error } = await supabase
        .from('discussions')
        .insert([discussionData])
        .select(`
          *,
          profiles:author_id(id, display_name, avatar)
        `)
        .single();

      if (error) throw error;
      
      toast.success('Discussão criada com sucesso!');
      
      // Add new discussion to state immediately
      if (data) {
        const newDiscussion: Discussion = {
          ...data,
          status: (data.status || 'open') as 'open' | 'closed',
          profiles: Array.isArray(data.profiles) && data.profiles.length > 0
            ? data.profiles[0]
            : { display_name: 'Usuário', avatar: null },
          discussion_replies: []
        };
        setDiscussions(prev => [newDiscussion, ...prev]);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      toast.error('Erro ao criar discussão');
    }
  }, [selectedCompany?.id, user?.id]);

  const toggleDiscussionStatus = useCallback(async (discussionId: string, newStatus: 'open' | 'closed') => {
    try {
      const { error } = await supabase
        .from('discussions')
        .update({ status: newStatus })
        .eq('id', discussionId);
        
      if (error) throw error;
      
      // Update local state immediately
      setDiscussions(prev => prev.map(discussion => 
        discussion.id === discussionId 
          ? {...discussion, status: newStatus} 
          : discussion
      ));
      
      toast.success(`Discussão ${newStatus === 'closed' ? 'concluída' : 'reaberta'} com sucesso!`);
    } catch (error: any) {
      console.error('Error updating discussion status:', error);
      toast.error('Erro ao atualizar status da discussão');
    }
  }, []);

  const deleteDiscussion = useCallback(async (discussionId: string) => {
    try {
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;
      
      // Remove from local state immediately
      setDiscussions(prev => prev.filter(d => d.id !== discussionId));
      toast.success('Discussão excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast.error('Erro ao excluir discussão');
    }
  }, []);

  const addReply = useCallback(async (discussionId: string, content: string, imageUrl?: string, videoUrl?: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para responder');
      return;
    }
    
    try {
      const replyData = {
        discussion_id: discussionId,
        content,
        author_id: user.id,
        image_url: imageUrl || null,
        video_url: videoUrl || null
      };

      const { data, error } = await supabase
        .from('discussion_replies')
        .insert([replyData])
        .select(`
          *,
          profiles:author_id(id, display_name, avatar)
        `)
        .single();

      if (error) throw error;
      
      // Add reply to local state immediately
      if (data) {
        const newReply: DiscussionReply = {
          ...data,
          profiles: Array.isArray(data.profiles) && data.profiles.length > 0
            ? data.profiles[0]
            : { display_name: 'Usuário', avatar: null }
        };
        
        setDiscussions(prev => prev.map(discussion => {
          if (discussion.id === discussionId) {
            return {
              ...discussion,
              discussion_replies: [...discussion.discussion_replies, newReply]
            };
          }
          return discussion;
        }));
      }
      
      toast.success('Resposta enviada com sucesso!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Erro ao enviar resposta');
    }
  }, [user?.id]);

  const deleteReply = useCallback(async (replyId: string) => {
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
      
      // Remove reply from local state immediately
      setDiscussions(prev => prev.map(discussion => ({
        ...discussion,
        discussion_replies: discussion.discussion_replies.filter(reply => reply.id !== replyId)
      })));
      
      toast.success('Resposta excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Erro ao excluir resposta');
    }
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  return {
    discussions,
    isLoading,
    createDiscussion,
    deleteDiscussion,
    addReply,
    deleteReply,
    toggleDiscussionStatus
  };
};
