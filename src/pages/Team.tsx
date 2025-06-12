
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembersOptimized } from "@/hooks/team/useTeamMembersOptimized";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TeamMetricsDashboardOptimized } from "@/components/team/TeamMetricsDashboardOptimized";
import { TeamMembersSkeletonList } from "@/components/team/TeamMembersSkeletonList";

const Team = () => {
  const { selectedCompany, isLoading: companiesLoading } = useCompanies();
  const { userProfile } = useAuth();

  // Use only the optimized hook
  const { 
    members, 
    isLoading: membersLoading, 
    error: membersError 
  } = useTeamMembersOptimized({
    selectedCompanyId: selectedCompany?.id,
    skipLoading: companiesLoading || !selectedCompany?.id
  });

  console.log('[Team] Estado atual:', {
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
        <TeamMembersSkeletonList />
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
