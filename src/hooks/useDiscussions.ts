
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
      
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          discussion_replies (
            id,
            discussion_id,
            content,
            created_at,
            author_id,
            image_url
          )
        `)
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setDiscussions([]);
        setIsLoading(false);
        return;
      }
      
      // Extract all user IDs from discussions and replies
      const authorIds = data.map(item => item.author_id);
      const replyAuthorIds = data.flatMap(item => 
        item.discussion_replies?.map(reply => reply.author_id) || []
      );
      
      // Combine and remove duplicates
      const allUserIds = [...new Set([...authorIds, ...replyAuthorIds])];
      
      // Fetch profile information for all authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', allUserIds);
        
      if (profilesError) throw profilesError;
      
      // Create a lookup map for profiles
      const profilesMap: Record<string, { display_name: string | null; avatar: string | null }> = {};
      (profilesData || []).forEach(profile => {
        profilesMap[profile.id] = {
          display_name: profile.display_name,
          avatar: profile.avatar
        };
      });
      
      // Format discussions with profile information
      const formattedDiscussions: Discussion[] = data.map((item) => {
        const authorProfile = profilesMap[item.author_id] || {
          display_name: 'Usuário desconhecido',
          avatar: null
        };
        
        const formattedReplies: DiscussionReply[] = (item.discussion_replies || []).map((reply) => {
          const replyAuthorProfile = profilesMap[reply.author_id] || {
            display_name: 'Usuário desconhecido',
            avatar: null
          };
          
          return {
            id: reply.id,
            discussion_id: item.id,
            content: reply.content,
            created_at: reply.created_at,
            author_id: reply.author_id,
            image_url: reply.image_url,
            profiles: replyAuthorProfile
          };
        });
        
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          author_id: item.author_id,
          company_id: item.company_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          image_url: item.image_url,
          profiles: authorProfile,
          discussion_replies: formattedReplies
        };
      });
      
      setDiscussions(formattedDiscussions);
    } catch (error) {
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
      // Create discussion object based on whether imageUrl is provided
      const discussionData = {
        title,
        content,
        company_id: selectedCompany.id,
        author_id: user.id,
        ...(imageUrl && { image_url: imageUrl })
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
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast.error('Erro ao criar discussão');
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
      // Create reply object based on whether imageUrl is provided
      const replyData = {
        discussion_id: discussionId,
        content,
        author_id: user.id,
        ...(imageUrl && { image_url: imageUrl })
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
    deleteReply
  };
};
