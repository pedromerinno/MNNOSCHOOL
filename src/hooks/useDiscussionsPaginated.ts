
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Discussion, DiscussionReply } from '@/types/discussions';
import { toast } from "sonner";

const DISCUSSIONS_PER_PAGE = 10;

interface FetchDiscussionsParams {
  companyId: string;
  offset?: number;
  limit?: number;
}

export const useDiscussionsPaginated = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchDiscussionsPage = useCallback(async ({ 
    companyId, 
    offset = 0, 
    limit = DISCUSSIONS_PER_PAGE 
  }: FetchDiscussionsParams) => {
    try {
      setIsLoading(true);
      
      // Buscar discussões com paginação
      const { data: discussionsData, error: discussionsError, count } = await supabase
        .from('discussions')
        .select('*', { count: 'exact' })
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (discussionsError) throw discussionsError;
      
      if (!discussionsData || discussionsData.length === 0) {
        return { 
          discussions: [], 
          totalCount: count || 0, 
          hasMore: false 
        };
      }

      // Buscar perfis dos autores das discussões
      const authorIds = discussionsData.map(d => d.author_id);
      const { data: authorsData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', authorIds);

      // Buscar respostas das discussões
      const discussionIds = discussionsData.map(d => d.id);
      const { data: repliesData } = await supabase
        .from('discussion_replies')
        .select('*')
        .in('discussion_id', discussionIds)
        .order('created_at', { ascending: true });

      // Buscar perfis dos autores das respostas
      const replyAuthorIds = repliesData?.map(r => r.author_id) || [];
      const uniqueReplyAuthorIds = [...new Set(replyAuthorIds)];
      let replyAuthorsData = [];
      
      if (uniqueReplyAuthorIds.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, avatar')
          .in('id', uniqueReplyAuthorIds);
        replyAuthorsData = data || [];
      }

      // Formatar dados
      const formattedDiscussions = discussionsData.map(discussion => {
        const author = authorsData?.find(a => a.id === discussion.author_id);
        const discussionReplies = repliesData?.filter(r => r.discussion_id === discussion.id) || [];
        
        const formattedReplies = discussionReplies.map(reply => {
          const replyAuthor = replyAuthorsData?.find(a => a.id === reply.author_id);
          return {
            ...reply,
            profiles: replyAuthor ? {
              display_name: replyAuthor.display_name,
              avatar: replyAuthor.avatar
            } : {
              display_name: 'Usuário',
              avatar: null
            }
          } as DiscussionReply;
        });

        return {
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
          profiles: author ? {
            display_name: author.display_name,
            avatar: author.avatar
          } : {
            display_name: 'Usuário',
            avatar: null
          },
          discussion_replies: formattedReplies
        } as Discussion;
      });
      
      const hasMore = offset + limit < (count || 0);
      
      return { 
        discussions: formattedDiscussions, 
        totalCount: count || 0, 
        hasMore 
      };
      
    } catch (error: any) {
      console.error('Error fetching discussions:', error);
      toast.error('Erro ao carregar discussões');
      return { 
        discussions: [], 
        totalCount: 0, 
        hasMore: false 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchDiscussionsPage,
    isLoading
  };
};
