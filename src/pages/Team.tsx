
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { LoadingState } from "@/components/team/LoadingState";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyThemedBadge } from "@/components/ui/badge";

const Team = () => {
  const { selectedCompany } = useCompanies();
  const { members, isLoading, error } = useTeamMembers();
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);
  const { userProfile } = useAuth();

  // Redirect if user is not an admin
  if (!userProfile?.is_admin && !userProfile?.super_admin) {
    return <Navigate to="/" replace />;
  }

  // Show a message if loading takes too long
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      timer = setTimeout(() => {
        setShowSlowLoadingMessage(true);
        toast.info("Carregando membros da equipe está demorando mais que o esperado");
      }, 5000); // Show message after 5 seconds of loading
    } else {
      setShowSlowLoadingMessage(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  if (!selectedCompany) {
    return (
      <PageLayout title="Equipe">
        <EmptyState 
          title="Selecione uma empresa"
          description="Selecione uma empresa no menu superior para visualizar a equipe."
        />
      </PageLayout>
    );
  }

  if (isLoading) {
    return <LoadingState slowLoading={showSlowLoadingMessage} />;
  }

  if (error) {
    return (
      <PageLayout title="Equipe">
        <EmptyState 
          title="Erro ao carregar equipe"
          description="Ocorreu um erro ao carregar os membros da equipe. Tente novamente mais tarde."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Equipe">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {members.length} {members.length === 1 ? 'membro' : 'membros'} fazem parte da equipe {selectedCompany.nome}
          </p>
          
          {userProfile?.is_admin && (
            <div className="text-sm">
              <CompanyThemedBadge variant="default">
                Clique em um card para ver o perfil completo do membro
              </CompanyThemedBadge>
            </div>
          )}
        </div>
        
        <TeamMembersList members={members} />
      </div>
    </PageLayout>
  );
};

export default Team;
