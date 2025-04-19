
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
          profiles:author_id (
            display_name,
            avatar
          ),
          discussion_replies (
            id,
            content,
            created_at,
            author_id,
            profiles:author_id (
              display_name,
              avatar
            )
          )
        `)
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data as Discussion[] || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Erro ao carregar discussões');
    } finally {
      setIsLoading(false);
    }
  };

  const createDiscussion = async (title: string, content: string) => {
    if (!selectedCompany?.id || !user?.id) {
      toast.error('Nenhuma empresa selecionada');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert([
          {
            title,
            content,
            company_id: selectedCompany.id,
            author_id: user.id
          }
        ])
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

  const addReply = async (discussionId: string, content: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para responder');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert([
          {
            discussion_id: discussionId,
            content,
            author_id: user.id
          }
        ]);

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

  // Fetch discussions when company changes
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
