
import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { TeamHeader } from "@/components/team/TeamHeader";
import { LoadingState } from "@/components/team/LoadingState";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { toast } from "sonner";

const Team = () => {
  const { selectedCompany } = useCompanies();
  const { members, isLoading, error } = useTeamMembers();
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);

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
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <EmptyState 
            title="Selecione uma empresa"
            description="Selecione uma empresa no menu superior para visualizar a equipe."
          />
        </main>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState slowLoading={showSlowLoadingMessage} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <EmptyState 
            title="Erro ao carregar equipe"
            description="Ocorreu um erro ao carregar os membros da equipe. Tente novamente mais tarde."
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <TeamHeader company={selectedCompany} memberCount={members.length} />
        <TeamMembersList members={members} />
      </main>
    </div>
  );
};

export default Team;
