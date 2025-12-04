
import { Navigate, useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { EmptyState } from "@/components/team/EmptyState";
import { useTeamMembersOptimized } from "@/hooks/team/useTeamMembersOptimized";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import { TeamMetricsDashboardOptimized } from "@/components/team/TeamMetricsDashboardOptimized";
import { PagePreloader } from "@/components/ui/PagePreloader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { AdminFloatingActionButton } from "@/components/admin/AdminFloatingActionButton";
import { TeamMembersSimplified } from "@/components/team/TeamMembersSimplified";
import { lazy, Suspense } from "react";

// Lazy load componentes pesados para melhor performance inicial
const LazyTeamMetricsDashboard = lazy(() => 
  Promise.resolve({ default: TeamMetricsDashboardOptimized })
);
const LazyTeamMembersSimplified = lazy(() => 
  Promise.resolve({ default: TeamMembersSimplified })
);

const Team = () => {
  const navigate = useNavigate();
  const { selectedCompany, isLoading: companiesLoading } = useCompanies();
  const { user, userProfile, loading: authLoading, profileLoading } = useAuth();
  const { isAdmin, isSuperAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Use only the optimized hook
  const { 
    members, 
    isLoading: membersLoading, 
    error: membersError 
  } = useTeamMembersOptimized({
    selectedCompanyId: selectedCompany?.id,
    skipLoading: companiesLoading || !selectedCompany?.id
  });

  // Se não tem usuário, mostrar preloader
  if (!user) {
    return <PagePreloader />;
  }

  // Se ainda está carregando auth inicial, mostrar preloader brevemente
  // Mas não bloquear por muito tempo
  if (authLoading && !userProfile) {
    return <PagePreloader />;
  }

  // Se é super admin, não precisa aguardar verificação de admin da empresa
  // Renderizar imediatamente
  const canRender = isSuperAdmin || !isAdminLoading;

  // Redirect if user is not an admin (só verificar depois que loading terminar)
  // Mas não bloquear renderização - verificar em background
  if (!isAdminLoading && !isAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  // Renderizar estrutura básica mesmo durante loading para melhor UX
  const renderContent = () => {
    // No company selected
    if (!selectedCompany) {
      return (
        <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
          <EmptyState 
            title="Selecione uma empresa" 
            description="Selecione uma empresa no menu superior para visualizar a equipe." 
          />
        </div>
      );
    }

    // Error state
    if (membersError) {
      return (
        <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
          <EmptyState 
            title="Erro ao carregar equipe" 
            description={membersError.message || "Ocorreu um erro ao carregar os membros da equipe. Tente novamente mais tarde."} 
          />
        </div>
      );
    }

    // Renderizar estrutura básica imediatamente, mesmo durante loading
    // Isso melhora a percepção de performance - usuário vê estrutura rapidamente
    const isLoading = companiesLoading || membersLoading;
    
    // Skeleton para métricas
    const metricsSkeleton = (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
    
    // Skeleton para lista de membros
    const membersSkeleton = (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
    
    return (
      <div className="space-y-6">
        {/* Métricas - usar lazy loading com fallback otimizado */}
        <Suspense fallback={metricsSkeleton}>
          {isLoading ? (
            metricsSkeleton
          ) : (
            <LazyTeamMetricsDashboard 
              members={members} 
              companyId={selectedCompany?.id}
              companyColor={selectedCompany?.cor_principal}
            />
          )}
        </Suspense>
        
        {/* Lista de membros - usar lazy loading com fallback otimizado */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
          <Suspense fallback={membersSkeleton}>
            {isLoading ? (
              membersSkeleton
            ) : (
              <LazyTeamMembersSimplified 
                members={members}
                companyId={selectedCompany?.id}
                companyColor={selectedCompany?.cor_principal}
              />
            )}
          </Suspense>
        </div>
      </div>
    );
  };

  // Renderizar estrutura básica imediatamente para melhor percepção de performance
  // Mesmo durante verificação de admin, mostrar a estrutura da página
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
              {selectedCompany && (
                <CompanyThemedBadge variant="beta">
                  {selectedCompany.nome}
                </CompanyThemedBadge>
              )}
            </div>
          </div>
          
          {/* Renderizar conteúdo mesmo durante verificação de admin */}
          {/* A verificação acontece em background e redireciona se necessário */}
          {canRender ? renderContent() : (
            <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
        <AdminFloatingActionButton />
      </div>
    </>
  );
};

export default Team;
