
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembersOptimized } from "@/hooks/team/useTeamMembersOptimized";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
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
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Equipe</h1>
          </div>
          <TeamMembersSkeletonList />
        </div>
      </DashboardLayout>
    );
  }

  // No company selected
  if (!selectedCompany) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Equipe</h1>
          </div>
          <EmptyState 
            title="Selecione uma empresa" 
            description="Selecione uma empresa no menu superior para visualizar a equipe." 
          />
        </div>
      </DashboardLayout>
    );
  }

  // Loading members
  if (membersLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Equipe</h1>
          </div>
          <TeamMembersSkeletonList />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (membersError) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Equipe</h1>
          </div>
          <EmptyState 
            title="Erro ao carregar equipe" 
            description={membersError.message || "Ocorreu um erro ao carregar os membros da equipe. Tente novamente mais tarde."} 
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Equipe</h1>
        </div>
        <div className="space-y-6">
          <TeamMetricsDashboardOptimized 
            members={members} 
            companyId={selectedCompany?.id}
            companyColor={selectedCompany?.cor_principal}
          />
          <TeamMembersList members={members} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Team;
