
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Discussion, DiscussionReply } from "@/types/discussions";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";

export const useDiscussions = () => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscussions = useCallback(async () => {
    if (!selectedCompany) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles:author_id (
            display_name,
            avatar
          ),
          discussion_replies:discussion_replies (
            *,
            profiles:author_id (
              display_name,
              avatar
            )
          )
        `)
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast the data to the Discussion[] type after checking for validity
      const processedData = data?.map(item => {
        // Handle discussion_replies conversion as well
        const processedReplies = (item.discussion_replies || []).map((reply: any) => {
          return {
            ...reply,
            // If profiles contains an error, set it to null
            profiles: reply.profiles && typeof reply.profiles === 'object' && !('error' in reply.profiles) 
              ? reply.profiles 
              : null
          } as DiscussionReply;
        });
        
        return {
          ...item,
          // Fixed: Ensure item.profiles is properly handled and won't cause null reference errors
          profiles: item.profiles && typeof item.profiles === 'object' && !('error' in item.profiles) 
            ? item.profiles 
            : null,
          discussion_replies: processedReplies
        } as Discussion;
      }) || [];
      
      setDiscussions(processedData);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error("Não foi possível carregar as discussões.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany]);

  const createDiscussion = async (title: string, content: string, imageUrl?: string, videoUrl?: string) => {
    if (!userProfile?.id || !selectedCompany) {
      toast.error("Você precisa estar logado para criar uma discussão.");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert([
          {
            title,
            content,
            author_id: userProfile.id,
            company_id: selectedCompany.id,
            image_url: imageUrl,
            video_url: videoUrl,
            status: 'open'
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Discussão criada com sucesso!");
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast.error("Não foi possível criar a discussão.");
    }
  };

  const deleteDiscussion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setDiscussions(discussions.filter(d => d.id !== id));
      toast.success("Discussão excluída com sucesso!");
    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast.error("Não foi possível excluir a discussão.");
    }
  };

  const addReply = async (discussionId: string, content: string, imageUrl?: string, videoUrl?: string) => {
    if (!userProfile?.id) {
      toast.error("Você precisa estar logado para responder.");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('discussion_replies')
        .insert([
          {
            discussion_id: discussionId,
            author_id: userProfile.id,
            content,
            image_url: imageUrl,
            video_url: videoUrl
          }
        ])
        .select(`
          *,
          profiles:author_id (
            display_name,
            avatar
          )
        `);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Fixed: Ensure data[0].profiles is properly handled with null checks
        const profilesData = data[0].profiles && 
                           typeof data[0].profiles === 'object' && 
                           !('error' in data[0].profiles) 
                           ? data[0].profiles 
                           : null;

        const processedReply = {
          ...data[0],
          profiles: profilesData
        } as DiscussionReply;
        
        // Update the local state
        setDiscussions(prev => 
          prev.map(discussion => {
            if (discussion.id === discussionId) {
              return {
                ...discussion,
                discussion_replies: [...discussion.discussion_replies, processedReply]
              };
            }
            return discussion;
          })
        );
        
        toast.success("Resposta enviada com sucesso!");
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error("Não foi possível enviar a resposta.");
    }
  };

  const deleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .delete()
        .eq('id', replyId);
      
      if (error) throw error;
      
      // Update the local state
      setDiscussions(prev => 
        prev.map(discussion => ({
          ...discussion,
          discussion_replies: discussion.discussion_replies.filter(reply => reply.id !== replyId)
        }))
      );
      
      toast.success("Resposta excluída com sucesso!");
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error("Não foi possível excluir a resposta.");
    }
  };

  const toggleDiscussionStatus = async (id: string, status: 'open' | 'closed') => {
    try {
      const { error } = await supabase
        .from('discussions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setDiscussions(prev => 
        prev.map(discussion => 
          discussion.id === id ? { ...discussion, status } : discussion
        )
      );
      
      toast.success(`Discussão marcada como ${status === 'closed' ? 'resolvida' : 'aberta'}.`);
    } catch (error) {
      console.error('Error toggling discussion status:', error);
      toast.error("Não foi possível atualizar o status da discussão.");
    }
  };

  useEffect(() => {
    if (selectedCompany) {
      fetchDiscussions();
    }
  }, [selectedCompany, fetchDiscussions]);

  return {
    discussions,
    isLoading,
    createDiscussion,
    deleteDiscussion,
    addReply,
    deleteReply,
    toggleDiscussionStatus,
    fetchDiscussions
  };
};
