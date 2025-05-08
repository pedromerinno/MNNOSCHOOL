
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
import { TeamMetricsDashboard } from "@/components/team/TeamMetricsDashboard";
import { Progress } from "@/components/ui/progress";

const Team = () => {
  const {
    selectedCompany
  } = useCompanies();
  const {
    members,
    isLoading,
    error,
    loadProgress
  } = useTeamMembers();
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);
  const {
    userProfile
  } = useAuth();

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
    return <PageLayout title="Equipe">
        <EmptyState title="Selecione uma empresa" description="Selecione uma empresa no menu superior para visualizar a equipe." />
      </PageLayout>;
  }

  if (isLoading) {
    return (
      <>
        <LoadingState slowLoading={showSlowLoadingMessage} />
        {loadProgress > 0 && loadProgress < 100 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50 w-64">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Carregando membros...</span>
                <span className="text-xs font-medium">{loadProgress}%</span>
              </div>
              <Progress value={loadProgress} className="h-2" />
            </div>
          </div>
        )}
      </>
    );
  }

  if (error) {
    return <PageLayout title="Equipe">
        <EmptyState title="Erro ao carregar equipe" description="Ocorreu um erro ao carregar os membros da equipe. Tente novamente mais tarde." />
      </PageLayout>;
  }

  return <PageLayout title="Equipe">
      <div className="space-y-6">
        {/* Add metrics dashboard */}
        <TeamMetricsDashboard members={members} />
        
        <TeamMembersList members={members} />
      </div>
    </PageLayout>;
};

export default Team;
