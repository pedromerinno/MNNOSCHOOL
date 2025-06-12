
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembersOptimized } from "@/hooks/team/useTeamMembersOptimized";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TeamMetricsDashboardOptimized } from "@/components/team/TeamMetricsDashboardOptimized";
import { TeamMembersSkeletonList } from "@/components/team/TeamMembersSkeletonList";

const Team = () => {
  const { selectedCompany, isLoading: companiesLoading } = useCompanies();
  const { userProfile } = useAuth();
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);

  // Use the optimized hook
  const { 
    members, 
    isLoading: membersLoading, 
    error: membersError 
  } = useTeamMembersOptimized({
    selectedCompanyId: selectedCompany?.id,
    skipLoading: companiesLoading || !selectedCompany?.id
  });

  console.log('[Team] Current state:', {
    companiesLoading,
    membersLoading,
    selectedCompanyId: selectedCompany?.id,
    membersCount: members.length,
    hasError: !!membersError
  });

  // Redirect if user is not an admin
  if (!userProfile?.is_admin && !userProfile?.super_admin) {
    return <Navigate to="/" replace />;
  }

  // Show slow loading message after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (membersLoading && !companiesLoading && selectedCompany?.id) {
      timer = setTimeout(() => {
        setShowSlowLoadingMessage(true);
        toast.info("Carregamento está demorando mais que o esperado");
      }, 3000);
    } else {
      setShowSlowLoadingMessage(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [membersLoading, companiesLoading, selectedCompany?.id]);

  // Loading companies
  if (companiesLoading) {
    return (
      <PageLayout title="Equipe">
        <TeamMembersSkeletonList />
      </PageLayout>
    );
  }

  // No company selected
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

  // Loading members
  if (membersLoading) {
    return (
      <PageLayout title="Equipe">
        <div className="space-y-6">
          <TeamMembersSkeletonList />
          
          {showSlowLoadingMessage && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50 w-64">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Carregando membros...
                  </span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Isso pode demorar um pouco mais...
                </p>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (membersError) {
    return (
      <PageLayout title="Equipe">
        <EmptyState 
          title="Erro ao carregar equipe" 
          description={membersError.message || "Ocorreu um erro ao carregar os membros da equipe. Tente novamente mais tarde."} 
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Equipe">
      <div className="space-y-6">
        <TeamMetricsDashboardOptimized 
          members={members} 
          companyId={selectedCompany?.id}
          companyColor={selectedCompany?.cor_principal}
        />
        <TeamMembersList members={members} />
      </div>
    </PageLayout>
  );
};

export default Team;
