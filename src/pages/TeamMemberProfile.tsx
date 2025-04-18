
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
import { useMemberProfile } from "@/hooks/team/useMemberProfile";

const TeamMemberProfile = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const { 
    member, 
    feedbacks, 
    isLoading, 
    error,
    addFeedback 
  } = useMemberProfile(memberId, selectedCompany?.id);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !member) {
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
            <FeedbackForm toUser={member} onFeedbackSent={addFeedback} />
            <FeedbackList feedbacks={feedbacks} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamMemberProfile;
