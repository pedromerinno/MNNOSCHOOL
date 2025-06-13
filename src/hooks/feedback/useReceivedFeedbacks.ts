
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { useOptimizedCache } from "@/hooks/useOptimizedCache";

export interface ReceivedFeedback {
  id: string;
  content: string;
  created_at: string;
  from_user_id?: string;
  from_profile?: {
    id: string;
    display_name: string | null;
    avatar: string | null;
    cargo_id?: string | null;
  } | null;
}

export const useReceivedFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<ReceivedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCompany } = useCompanies();
  const { getCache, setCache } = useOptimizedCache();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!selectedCompany) {
        setFeedbacks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Verificar cache primeiro
        const cacheKey = `feedbacks_${selectedCompany.id}`;
        const cachedData = getCache<ReceivedFeedback[]>(cacheKey);
        if (cachedData && Array.isArray(cachedData)) {
          console.log(`Using cached feedbacks for company ${selectedCompany.id}`);
          setFeedbacks(cachedData);
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Buscar feedbacks com limite ainda menor para home
        const { data: feedbackData, error } = await supabase
          .from('user_feedbacks')
          .select('id, content, created_at, from_user_id')
          .eq('to_user_id', user.id)
          .eq('company_id', selectedCompany.id)
          .order('created_at', { ascending: false })
          .limit(2); // Reduzir ainda mais para home

        if (error) {
          throw error;
        }

        if (!feedbackData || feedbackData.length === 0) {
          setFeedbacks([]);
          setCache(cacheKey, [], 2); // Cache mais longo para dados vazios
          setLoading(false);
          return;
        }

        // Buscar perfis em batch
        const userIds = [...new Set(feedbackData.map(f => f.from_user_id).filter(Boolean))];
        const profilesPromise = userIds.length > 0 
          ? supabase
              .from('profiles')
              .select('id, display_name, avatar, cargo_id')
              .in('id', userIds)
          : Promise.resolve({ data: [], error: null });

        const { data: profilesData, error: profilesError } = await profilesPromise;

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Criar mapa de perfis
        const profilesMap = new Map();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });

        // Enriquecer feedbacks com perfis
        const enrichedFeedbacks = feedbackData.map(feedback => ({
          ...feedback,
          from_profile: feedback.from_user_id ? profilesMap.get(feedback.from_user_id) || null : null
        }));
        
        // Cache com TTL de 2 minutos
        setCache(cacheKey, enrichedFeedbacks, 2);
        setFeedbacks(enrichedFeedbacks);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        toast.error("Erro ao carregar feedbacks");
      } finally {
        setLoading(false);
      }
    };

    // Remover debounce para carregamento imediato
    fetchFeedbacks();
  }, [selectedCompany, getCache, setCache]);

  return { feedbacks, loading };
};
