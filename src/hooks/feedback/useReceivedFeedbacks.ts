
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";

export interface ReceivedFeedback {
  id: string;
  content: string;
  created_at: string;
  from_user_id?: string;
  from_profile?: {
    id: string;
    display_name: string | null;
    avatar: string | null;
    // Removed cargo field as it doesn't exist in profiles table
  } | null;
}

export const useReceivedFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<ReceivedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCompany } = useCompanies();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!selectedCompany) {
        setFeedbacks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // First, fetch the feedbacks
        const { data: feedbackData, error } = await supabase
          .from('user_feedbacks')
          .select('id, content, created_at, from_user_id')
          .eq('to_user_id', user.id)
          .eq('company_id', selectedCompany.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        if (!feedbackData || feedbackData.length === 0) {
          setFeedbacks([]);
          setLoading(false);
          return;
        }

        // Then fetch the associated profiles - updated to remove 'cargo' field
        const enrichedFeedbacks = await Promise.all(
          (feedbackData || []).map(async (feedback) => {
            if (!feedback.from_user_id) {
              return {
                ...feedback,
                from_profile: null
              };
            }

            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id, display_name, avatar')
              .eq('id', feedback.from_user_id)
              .single();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
              return {
                ...feedback,
                from_profile: null
              };
            }

            return {
              ...feedback,
              from_profile: profileData || null
            };
          })
        );
        
        setFeedbacks(enrichedFeedbacks);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        toast.error("Erro ao carregar feedbacks");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [selectedCompany]);

  return { feedbacks, loading };
};
