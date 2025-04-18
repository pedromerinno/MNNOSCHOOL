
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      if (!memberId || !selectedCompany) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email, cargo, avatar, is_admin')
          .eq('id', memberId)
          .single();

        if (error) {
          throw error;
        }

        setMember(data);

        const { data: feedbackData, error: feedbackError } = await supabase
          .from('user_feedbacks')
          .select('id, content, created_at, from_user_id')
          .eq('to_user_id', memberId)
          .eq('company_id', selectedCompany.id)
          .order('created_at', { ascending: false });

        if (feedbackError) {
          console.error("Error fetching feedbacks:", feedbackError);
          throw feedbackError;
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
        console.error('Error fetching member profile or feedbacks:', err);
        toast.error("Erro ao carregar dados do perfil");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberProfile();
  }, [memberId, selectedCompany]);

  const handleSubmitFeedback = async (feedback: string) => {
    if (!selectedCompany || !memberId) return;

    try {
      setSubmitting(true);
      
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;
      
      if (!currentUserId) {
        toast.error("Erro ao identificar usuário atual");
        return;
      }

      const { data: insertedFeedback, error } = await supabase
        .from('user_feedbacks')
        .insert({
          from_user_id: currentUserId,
          to_user_id: memberId,
          company_id: selectedCompany.id,
          content: feedback
        })
        .select('id, content, created_at, from_user_id')
        .single();

      if (error) {
        throw error;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .eq('id', currentUserId)
        .single();

      const newFeedback = {
        ...insertedFeedback,
        from_profile: profileData || null
      };

      setFeedbacks([newFeedback, ...feedbacks]);
      toast.success("Feedback enviado com sucesso!");
    } catch (err: any) {
      console.error('Error sending feedback:', err);
      toast.error(err.message || "Erro ao enviar feedback");
    } finally {
      setSubmitting(false);
    }
  };

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
            <ArrowLeft className="h-4 w-4" /> Back to Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ProfileCard member={member} />
          </div>
          
          <div className="md:col-span-2">
            <FeedbackForm 
              memberName={member.display_name}
              onSubmit={handleSubmitFeedback}
              isSubmitting={submitting}
            />
            <FeedbackList feedbacks={feedbacks} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamMemberProfile;
