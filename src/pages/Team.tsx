
import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { LoadingState } from "@/components/team/LoadingState";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyThemedBadge } from "@/components/ui/badge";

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
      <main className="container mx-auto px-6 py-12">
        <div className="flex items-center mb-12 gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 hover:bg-transparent" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold dark:text-white">
              Equipe
            </h1>
            {selectedCompany && (
              <CompanyThemedBadge 
                variant="beta"
              >
                {selectedCompany.nome}
              </CompanyThemedBadge>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
          <p className="text-muted-foreground">
            {members.length} {members.length === 1 ? 'membro' : 'membros'} fazem parte da equipe {selectedCompany.nome}
          </p>
          <TeamMembersList members={members} />
        </div>
      </main>
    </div>
  );
};

export default Team;
