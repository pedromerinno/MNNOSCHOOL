
import { useEffect, useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from "sonner";
import { Discussion, DiscussionReply } from '@/types/discussions';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscussionsCache } from './useDiscussionsCache';
import { useDiscussionsPaginated } from './useDiscussionsPaginated';

export const useDiscussions = () => {
  const { selectedCompany } = useCompanies();
  const { user, userProfile } = useAuth();
  const { getCachedData, setCachedData, clearCache } = useDiscussionsCache();
  const { fetchDiscussionsPage, isLoading: isPaginationLoading } = useDiscussionsPaginated();
  
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchDiscussions = useCallback(async (useCache = true) => {
    if (!selectedCompany?.id) {
      setDiscussions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Tentar usar cache primeiro
      if (useCache) {
        const cachedData = getCachedData(selectedCompany.id);
        if (cachedData) {
          setDiscussions(cachedData.discussions);
          setTotalCount(cachedData.totalCount);
          setHasMore(cachedData.hasMore);
          setIsLoading(false);
          return;
        }
      }

      // Buscar primeira página com consulta otimizada
      const result = await fetchDiscussionsPage({
        companyId: selectedCompany.id,
        offset: 0,
        limit: 10
      });
      
      setDiscussions(result.discussions);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setCurrentPage(0);
      
      // Cache os resultados
      setCachedData(selectedCompany.id, result.discussions, result.totalCount, result.hasMore);
      
    } catch (error: any) {
      console.error('Error fetching discussions:', error);
      toast.error('Erro ao carregar discussões');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany?.id, getCachedData, setCachedData, fetchDiscussionsPage]);

  const loadMoreDiscussions = useCallback(async () => {
    if (!selectedCompany?.id || !hasMore || isPaginationLoading) return;

    try {
      const nextOffset = (currentPage + 1) * 10;
      const result = await fetchDiscussionsPage({
        companyId: selectedCompany.id,
        offset: nextOffset,
        limit: 10
      });
      
      setDiscussions(prev => [...prev, ...result.discussions]);
      setHasMore(result.hasMore);
      setCurrentPage(prev => prev + 1);
      
      // Atualizar cache com todos os dados
      const allDiscussions = [...discussions, ...result.discussions];
      setCachedData(selectedCompany.id, allDiscussions, result.totalCount, result.hasMore);
      
    } catch (error: any) {
      console.error('Error loading more discussions:', error);
      toast.error('Erro ao carregar mais discussões');
    }
  }, [selectedCompany?.id, hasMore, currentPage, discussions, fetchDiscussionsPage, setCachedData, isPaginationLoading]);

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
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Discussão criada com sucesso!');
      
      // Limpar cache e recarregar
      clearCache();
      await fetchDiscussions(false);
      
      return data;
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      toast.error('Erro ao criar discussão');
    }
  }, [selectedCompany?.id, user?.id, userProfile, clearCache, fetchDiscussions]);

  const toggleDiscussionStatus = useCallback(async (discussionId: string, newStatus: 'open' | 'closed') => {
    try {
      const { error } = await supabase
        .from('discussions')
        .update({ status: newStatus })
        .eq('id', discussionId);
        
      if (error) throw error;
      
      setDiscussions(prev => prev.map(discussion => 
        discussion.id === discussionId 
          ? {...discussion, status: newStatus} 
          : discussion
      ));
      
      clearCache();
      
      toast.success(`Discussão ${newStatus === 'closed' ? 'concluída' : 'reaberta'} com sucesso!`);
    } catch (error: any) {
      console.error('Error updating discussion status:', error);
      toast.error('Erro ao atualizar status da discussão');
    }
  }, [clearCache]);

  const deleteDiscussion = useCallback(async (discussionId: string) => {
    try {
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;
      
      setDiscussions(prev => prev.filter(d => d.id !== discussionId));
      clearCache();
      toast.success('Discussão excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast.error('Erro ao excluir discussão');
    }
  }, [clearCache]);

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
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        const newReply: DiscussionReply = {
          ...data,
          profiles: {
            display_name: userProfile?.display_name || 'Usuário',
            avatar: userProfile?.avatar || null
          }
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
        
        clearCache();
      }
      
      toast.success('Resposta enviada com sucesso!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Erro ao enviar resposta');
    }
  }, [user?.id, userProfile, clearCache]);

  const deleteReply = useCallback(async (replyId: string) => {
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
      
      setDiscussions(prev => prev.map(discussion => ({
        ...discussion,
        discussion_replies: discussion.discussion_replies.filter(reply => reply.id !== replyId)
      })));
      
      clearCache();
      toast.success('Resposta excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Erro ao excluir resposta');
    }
  }, [clearCache]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  return {
    discussions,
    isLoading: isLoading || isPaginationLoading,
    totalCount,
    hasMore,
    createDiscussion,
    deleteDiscussion,
    addReply,
    deleteReply,
    toggleDiscussionStatus,
    loadMoreDiscussions,
    refreshDiscussions: () => fetchDiscussions(false)
  };
};
