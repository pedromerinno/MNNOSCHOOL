
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembersOptimized } from "@/hooks/team/useTeamMembersOptimized";
import { useAuth } from "@/contexts/AuthContext";
import { TeamMetricsDashboardOptimized } from "@/components/team/TeamMetricsDashboardOptimized";
import { TeamMembersSkeletonList } from "@/components/team/TeamMembersSkeletonList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { AdminFloatingActionButton } from "@/components/admin/AdminFloatingActionButton";
import { PagePreloader } from "@/components/ui/PagePreloader";
import { TeamMembersSimplified } from "@/components/team/TeamMembersSimplified";

const Team = () => {
  const navigate = useNavigate();
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

  // Loading companies or members
  if (companiesLoading || membersLoading) {
    return <PagePreloader />;
  }

  // No company selected
  if (!selectedCompany) {
    return (
      <>
        <MainNavigationMenu />
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
          <main className="container mx-auto px-6 py-12">
            <div className="flex items-center mb-12 gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold dark:text-white">
                  Equipe
                </h1>
              </div>
            </div>
            
            <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
              <EmptyState 
                title="Selecione uma empresa" 
                description="Selecione uma empresa no menu superior para visualizar a equipe." 
              />
            </div>
          </main>
          <AdminFloatingActionButton />
        </div>
      </>
    );
  }

  // Error state
  if (membersError) {
    return (
      <>
        <MainNavigationMenu />
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
          <main className="container mx-auto px-6 py-12">
            <div className="flex items-center mb-12 gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold dark:text-white">
                  Equipe
                </h1>
                <CompanyThemedBadge variant="beta">
                  {selectedCompany.nome}
                </CompanyThemedBadge>
              </div>
            </div>
            
            <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
              <EmptyState 
                title="Erro ao carregar equipe" 
                description={membersError.message || "Ocorreu um erro ao carregar os membros da equipe. Tente novamente mais tarde."} 
              />
            </div>
          </main>
          <AdminFloatingActionButton />
        </div>
      </>
    );
  }

  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
        <main className="container mx-auto px-6 py-12">
          <div className="flex items-center mb-12 gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 hover:bg-transparent" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold dark:text-white">
                Equipe
              </h1>
              <CompanyThemedBadge variant="beta">
                {selectedCompany.nome}
              </CompanyThemedBadge>
            </div>
          </div>
          
          <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
            <div className="space-y-6">
              <TeamMetricsDashboardOptimized 
                members={members} 
                companyId={selectedCompany?.id}
                companyColor={selectedCompany?.cor_principal}
              />
              <TeamMembersSimplified 
                members={members}
                companyId={selectedCompany?.id}
                companyColor={selectedCompany?.cor_principal}
              />
            </div>
          </div>
        </main>
        <AdminFloatingActionButton />
      </div>
    </>
  );
};

export default Team;
