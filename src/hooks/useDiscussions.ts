
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from "sonner";
import { Discussion, DiscussionReply } from '@/types/discussions';
import { useAuth } from '@/contexts/AuthContext';

export const useDiscussions = () => {
  const { selectedCompany } = useCompanies();
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscussions = async () => {
    if (!selectedCompany?.id) return;

    try {
      setIsLoading(true);
      
      // Fetch discussions first
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('discussions')
        .select('*')
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (discussionsError) throw discussionsError;
      
      if (!discussionsData || discussionsData.length === 0) {
        setDiscussions([]);
        return;
      }
      
      // Fetch profiles for authors
      const authorIds = [...new Set(discussionsData.map(d => d.author_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', authorIds);
        
      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError);
      }
      
      // Create a map of profiles by id for quick lookup
      const profilesMap = (profilesData || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {} as Record<string, any>);
      
      // Fetch all replies for these discussions
      const discussionIds = discussionsData.map(d => d.id);
      const { data: repliesData, error: repliesError } = await supabase
        .from('discussion_replies')
        .select('*')
        .in('discussion_id', discussionIds)
        .order('created_at', { ascending: true });
        
      if (repliesError) {
        console.warn('Error fetching replies:', repliesError);
      }
      
      // Fetch profiles for reply authors
      const replyAuthorIds = [...new Set((repliesData || []).map(r => r.author_id))];
      const { data: replyProfilesData, error: replyProfilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', replyAuthorIds);
        
      if (replyProfilesError) {
        console.warn('Error fetching reply author profiles:', replyProfilesError);
      }
      
      // Create a map of reply author profiles
      const replyProfilesMap = (replyProfilesData || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {} as Record<string, any>);
      
      // Group replies by discussion_id
      const repliesByDiscussionId = (repliesData || []).reduce((map, reply) => {
        if (!map[reply.discussion_id]) {
          map[reply.discussion_id] = [];
        }
        map[reply.discussion_id].push({
          ...reply,
          profiles: replyProfilesMap[reply.author_id] || { display_name: 'Usuário', avatar: null }
        });
        return map;
      }, {} as Record<string, any[]>);
      
      // Transform the data to match the Discussion type
      const formattedData = discussionsData.map(discussion => {
        return {
          id: discussion.id,
          title: discussion.title,
          content: discussion.content,
          author_id: discussion.author_id,
          company_id: discussion.company_id,
          created_at: discussion.created_at,
          updated_at: discussion.updated_at,
          // Use the image_url from the database or null if it doesn't exist
          image_url: discussion.image_url || null,
          // Use the status from the database or 'open' as default
          status: discussion.status || 'open' as const,
          // Use the profile from our map, or a default if not found
          profiles: profilesMap[discussion.author_id] || { display_name: 'Usuário', avatar: null },
          // Use the grouped replies or an empty array
          discussion_replies: (repliesByDiscussionId[discussion.id] || []) as DiscussionReply[]
        } as Discussion;
      });
      
      setDiscussions(formattedData);
    } catch (error: any) {
      console.error('Error fetching discussions:', error);
      toast.error('Erro ao carregar discussões');
    } finally {
      setIsLoading(false);
    }
  };

  const createDiscussion = async (title: string, content: string, imageUrl?: string) => {
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
        status: 'open' as const
      };

      const { data, error } = await supabase
        .from('discussions')
        .insert([discussionData])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Discussão criada com sucesso!');
      await fetchDiscussions();
      return data;
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      toast.error('Erro ao criar discussão');
    }
  };

  const toggleDiscussionStatus = async (discussionId: string, newStatus: 'open' | 'closed') => {
    try {
      // Update the status in the database
      const { error } = await supabase
        .from('discussions')
        .update({ status: newStatus })
        .eq('id', discussionId);
        
      if (error) throw error;
      
      // Update local state
      setDiscussions(discussions.map(discussion => 
        discussion.id === discussionId 
          ? {...discussion, status: newStatus} 
          : discussion
      ));
      
      toast.success(`Discussão ${newStatus === 'closed' ? 'concluída' : 'reaberta'} com sucesso!`);
    } catch (error: any) {
      console.error('Error updating discussion status:', error);
      toast.error('Erro ao atualizar status da discussão');
    }
  };

  const deleteDiscussion = async (discussionId: string) => {
    try {
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;
      
      toast.success('Discussão excluída com sucesso!');
      await fetchDiscussions();
    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast.error('Erro ao excluir discussão');
    }
  };

  const addReply = async (discussionId: string, content: string, imageUrl?: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para responder');
      return;
    }
    
    try {
      const replyData = {
        discussion_id: discussionId,
        content,
        author_id: user.id,
        image_url: imageUrl || null
      };

      const { error } = await supabase
        .from('discussion_replies')
        .insert([replyData]);

      if (error) throw error;
      
      toast.success('Resposta enviada com sucesso!');
      await fetchDiscussions();
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Erro ao enviar resposta');
    }
  };

  const deleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
      
      toast.success('Resposta excluída com sucesso!');
      await fetchDiscussions();
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Erro ao excluir resposta');
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCompany?.id]);

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
