
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";

export interface ReceivedFeedback {
  id: string;
  content: string;
  created_at: string;
  from_profile?: {
    id: string;
    display_name: string | null;
    avatar: string | null;
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

        if (feedbackData && feedbackData.length > 0) {
          const enrichedFeedbacks = await Promise.all(
            feedbackData.map(async (fb) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, display_name, avatar')
                .eq('id', fb.from_user_id)
                .single();
              
              return {
                ...fb,
                from_profile: profileData || null
              };
            })
          );
          
          setFeedbacks(enrichedFeedbacks);
        } else {
          setFeedbacks([]);
        }
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
