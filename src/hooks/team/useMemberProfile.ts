
import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/hooks/useUsers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  content: string;
  created_at: string;
  from_user_id: string;
  from_profile?: {
    id: string;
    display_name: string | null;
    avatar: string | null;
  } | null;
}

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

type ProfileCache = {
  memberId: string;
  companyId: string;
  member: UserProfile;
  feedbacks: Feedback[];
  timestamp: number;
};

export function useMemberProfile(memberId?: string, companyId?: string) {
  const [member, setMember] = useState<UserProfile | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Cache management functions
  const getCachedProfile = useCallback((): ProfileCache | null => {
    if (!memberId || !companyId) return null;
    
    try {
      const cached = localStorage.getItem(`memberProfile_${memberId}_${companyId}`);
      if (!cached) return null;

      const cache = JSON.parse(cached) as ProfileCache;
      const now = Date.now();
      
      if (cache && now - cache.timestamp < CACHE_DURATION) {
        return cache;
      }
      
      return null;
    } catch (err) {
      console.error('Error reading profile cache:', err);
      return null;
    }
  }, [memberId, companyId]);

  const setCachedProfile = useCallback((member: UserProfile, feedbacks: Feedback[]) => {
    if (!memberId || !companyId) return;
    
    try {
      const cache: ProfileCache = {
        memberId,
        companyId,
        member,
        feedbacks,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`memberProfile_${memberId}_${companyId}`, JSON.stringify(cache));
    } catch (err) {
      console.error('Error caching profile:', err);
    }
  }, [memberId, companyId]);

  // Load member profile and feedback data
  useEffect(() => {
    const fetchMemberProfile = async () => {
      if (!memberId || !companyId) {
        setIsLoading(false);
        return;
      }

      setError(null);
      
      // Try to get cached data first
      const cachedData = getCachedProfile();
      if (cachedData) {
        console.log('Using cached profile data');
        setMember(cachedData.member);
        setFeedbacks(cachedData.feedbacks);
        setIsLoading(false);
        
        // Fetch updated data in the background
        fetchFreshData();
        return;
      }
      
      setIsLoading(true);
      fetchFreshData();
    };

    const fetchFreshData = async () => {
      if (!memberId || !companyId) return;
      
      try {
        // Fetch member profile
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email, cargo, avatar, is_admin')
          .eq('id', memberId)
          .single();

        if (error) {
          throw error;
        }

        const memberData = data as UserProfile;
        setMember(memberData);

        // Fetch feedbacks
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('user_feedbacks')
          .select('id, content, created_at, from_user_id')
          .eq('to_user_id', memberId)
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (feedbackError) {
          console.error("Error fetching feedbacks:", feedbackError);
          throw feedbackError;
        }

        if (feedbackData && feedbackData.length > 0) {
          // Fetch profiles for all feedback authors in a single query
          const authorIds = [...new Set(feedbackData.map(fb => fb.from_user_id))];
          
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar')
            .in('id', authorIds);
          
          // Create a map of author profiles for quick lookup
          const authorProfiles = profilesData ? 
            Object.fromEntries(profilesData.map(profile => [profile.id, profile])) : 
            {};
          
          // Enrich feedbacks with author profiles
          const enrichedFeedbacks = feedbackData.map(fb => ({
            ...fb,
            from_profile: authorProfiles[fb.from_user_id] || null
          }));
          
          setFeedbacks(enrichedFeedbacks);
          
          // Cache the results
          setCachedProfile(memberData, enrichedFeedbacks);
        } else {
          setFeedbacks([]);
          // Cache even with empty feedbacks
          setCachedProfile(memberData, []);
        }
      } catch (err) {
        console.error('Error fetching member profile or feedbacks:', err);
        toast.error("Erro ao carregar dados do perfil");
        setError(err instanceof Error ? err : new Error('Failed to load profile'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberProfile();
  }, [memberId, companyId, getCachedProfile, setCachedProfile]);

  // Setup real-time subscription for feedbacks
  useEffect(() => {
    if (!memberId || !companyId) return;

    // Create a subscription for real-time updates
    const channel = supabase
      .channel('member_feedbacks_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_feedbacks',
          filter: `to_user_id=eq.${memberId}`
        },
        async (payload) => {
          const newFeedback = payload.new as any;
          
          // Only process if it's for the current company
          if (newFeedback.company_id === companyId) {
            // Fetch the profile of the feedback author
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, display_name, avatar')
              .eq('id', newFeedback.from_user_id)
              .single();
            
            const enrichedFeedback = {
              ...newFeedback,
              from_profile: profileData || null
            };
            
            // Update the state with the new feedback
            setFeedbacks(prev => [enrichedFeedback, ...prev]);
            
            // Update the cache
            if (member) {
              setCachedProfile(member, [enrichedFeedback, ...feedbacks]);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [memberId, companyId, feedbacks, member, setCachedProfile]);

  // Function to add a new feedback to the state without fetching from server
  const addFeedback = useCallback((feedback: Feedback) => {
    setFeedbacks(prev => [feedback, ...prev]);
    
    // Update cache if we have the member data
    if (member) {
      setCachedProfile(member, [feedback, ...feedbacks]);
    }
  }, [member, feedbacks, setCachedProfile]);

  return { 
    member, 
    feedbacks, 
    isLoading, 
    error,
    addFeedback
  };
}
