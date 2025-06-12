
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TeamMetricsDashboard } from "@/components/team/TeamMetricsDashboard";
import { Progress } from "@/components/ui/progress";
import { TeamMembersSkeletonList } from "@/components/team/TeamMembersSkeletonList";

const Team = () => {
  const { selectedCompany, isLoading: companiesLoading } = useCompanies();
  const { members, isLoading, error, loadProgress } = useTeamMembers();
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);
  const { userProfile } = useAuth();

  // Redirect if user is not an admin
  if (!userProfile?.is_admin && !userProfile?.super_admin) {
    return <Navigate to="/" replace />;
  }

  // Show a message if loading takes too long
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading && !companiesLoading) {
      timer = setTimeout(() => {
        setShowSlowLoadingMessage(true);
        toast.info("Carregamento está demorando mais que o esperado");
      }, 3000); // Reduzido para 3 segundos
    } else {
      setShowSlowLoadingMessage(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, companiesLoading]);

  // Aguardar empresas carregarem primeiro
  if (companiesLoading) {
    return (
      <PageLayout title="Equipe">
        <TeamMembersSkeletonList />
      </PageLayout>
    );
  }

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
    return (
      <PageLayout title="Equipe">
        <div className="space-y-6">
          <TeamMembersSkeletonList />
          
          {(loadProgress > 0 && loadProgress < 100) || showSlowLoadingMessage ? (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50 w-64">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {showSlowLoadingMessage ? "Carregamento lento..." : "Carregando membros..."}
                  </span>
                  <span className="text-xs font-medium">{loadProgress}%</span>
                </div>
                <Progress value={loadProgress} className="h-2" />
                {showSlowLoadingMessage && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Isso pode demorar um pouco mais...
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Equipe">
        <EmptyState 
          title="Erro ao carregar equipe" 
          description={error.message || "Ocorreu um erro ao carregar os membros da equipe. Tente novamente mais tarde."} 
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Equipe">
      <div className="space-y-6">
        <TeamMetricsDashboard members={members} />
        <TeamMembersList members={members} />
      </div>
    </PageLayout>
  );
};

export default Team;
