import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { UserProfile } from "@/hooks/useUsers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/team/LoadingState";
import { EmptyState } from "@/components/team/EmptyState";
import { ProfileCard } from "@/components/team/profile/ProfileCard";
import { FeedbackForm } from "@/components/team/feedback/FeedbackForm";
import { FeedbackList } from "@/components/team/feedback/FeedbackList";

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

const TeamMemberProfile = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const [member, setMember] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      if (!memberId || !selectedCompany) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get the member profile - updated to remove 'cargo' which doesn't exist
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, email, cargo_id, avatar, is_admin')
          .eq('id', memberId)
          .single();

        if (profileError) throw profileError;
        setMember(profileData);

        // Get the feedbacks for the member without the join
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('user_feedbacks')
          .select('id, content, created_at, from_user_id')
          .eq('to_user_id', memberId)
          .eq('company_id', selectedCompany.id)
          .order('created_at', { ascending: false });

        if (feedbackError) throw feedbackError;

        // Get profile information for each feedback sender separately
        const enrichedFeedbacks = await Promise.all(
          (feedbackData || []).map(async (feedback) => {
            if (!feedback.from_user_id) {
              return {
                ...feedback,
                from_profile: null
              };
            }

            const { data: fromProfileData } = await supabase
              .from('profiles')
              .select('id, display_name, avatar')
              .eq('id', feedback.from_user_id)
              .single();

            return {
              ...feedback,
              from_profile: fromProfileData || null
            };
          })
        );

        setFeedbacks(enrichedFeedbacks);
      } catch (err) {
        console.error('Error fetching member profile or feedbacks:', err);
        toast.error("Erro ao carregar dados do perfil");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberProfile();
  }, [memberId, selectedCompany]);

  useEffect(() => {
    if (!memberId || !selectedCompany) return;

    const channel = supabase
      .channel('user_feedbacks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_feedbacks',
          filter: `to_user_id=eq.${memberId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newFeedback = payload.new as any;
            
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, display_name, avatar')
              .eq('id', newFeedback.from_user_id)
              .single();
            
            const enrichedFeedback = {
              ...newFeedback,
              from_profile: profileData || null
            };
            
            setFeedbacks(prev => [enrichedFeedback, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memberId, selectedCompany]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <EmptyState 
            title="Membro não encontrado"
            description="Não foi possível encontrar o membro solicitado."
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2" 
            onClick={() => navigate('/team')}
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Equipe
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ProfileCard member={member} />
          </div>
          
          <div className="md:col-span-2">
            <FeedbackForm toUser={member} />
            <FeedbackList feedbacks={feedbacks} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamMemberProfile;
