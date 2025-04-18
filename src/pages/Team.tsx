
import { useCompanies } from "@/hooks/useCompanies";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { TeamHeader } from "@/components/team/TeamHeader";
import { LoadingState } from "@/components/team/LoadingState";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";

const Team = () => {
  const { selectedCompany } = useCompanies();
  const { members, isLoading, error } = useTeamMembers();

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

  // For extreme loading scenarios, show full page loading
  if (isLoading && members.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <TeamHeader company={selectedCompany} memberCount={members.length} />
        <TeamMembersList members={members} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default Team;
