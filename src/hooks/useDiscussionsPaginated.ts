
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
      
      // Single optimized query with joins to reduce round trips
      const { data: discussionsData, error: discussionsError, count } = await supabase
        .from('discussions')
        .select(`
          id,
          title,
          content,
          author_id,
          company_id,
          created_at,
          updated_at,
          image_url,
          video_url,
          status,
          author_profile:profiles!author_id(
            display_name,
            avatar
          ),
          discussion_replies(
            id,
            discussion_id,
            content,
            author_id,
            created_at,
            image_url,
            video_url,
            reply_profile:profiles!author_id(
              display_name,
              avatar
            )
          )
        `, { count: 'exact' })
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

      // Format the data with proper typing
      const formattedDiscussions = discussionsData.map(discussion => {
        const formattedReplies = discussion.discussion_replies?.map(reply => ({
          id: reply.id,
          discussion_id: reply.discussion_id,
          content: reply.content,
          author_id: reply.author_id,
          created_at: reply.created_at,
          image_url: reply.image_url,
          video_url: reply.video_url,
          profiles: reply.reply_profile && typeof reply.reply_profile === 'object' ? {
            display_name: (reply.reply_profile as any).display_name,
            avatar: (reply.reply_profile as any).avatar
          } : {
            display_name: 'Usuário',
            avatar: null
          }
        } as DiscussionReply)) || [];

        return {
          id: discussion.id,
          title: discussion.title,
          content: discussion.content,
          author_id: discussion.author_id,
          company_id: discussion.company_id,
          created_at: discussion.created_at,
          updated_at: discussion.updated_at,
          image_url: discussion.image_url,
          video_url: discussion.video_url,
          status: (discussion.status || 'open') as 'open' | 'closed',
          profiles: discussion.author_profile && typeof discussion.author_profile === 'object' ? {
            display_name: (discussion.author_profile as any).display_name,
            avatar: (discussion.author_profile as any).avatar
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
