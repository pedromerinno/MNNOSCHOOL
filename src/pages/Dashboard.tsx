
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardChallenges } from "@/components/dashboard/DashboardChallenges";
import { LeaderBoard } from "@/components/dashboard/LeaderBoard";
import { UserInfoHeader } from "@/components/dashboard/UserInfoHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { getUserCompanies, selectedCompany, isLoading, userCompanies } = useCompanies();
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Buscar empresas do usuário apenas se necessário
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id && userCompanies.length === 0) {
        try {
          await getUserCompanies(user.id, false);
        } catch (error) {
          console.error('Error fetching companies:', error);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies, userCompanies.length]);

  // Atualizar estado de carregamento com base no estado real dos dados
  useEffect(() => {
    // Se temos empresa selecionada ou os dados já foram carregados, não estamos mais carregando
    if (selectedCompany || !isLoading) {
      setIsPageLoading(false);
    }
  }, [isLoading, selectedCompany]);

  // Melhorado o skeleton para mostrar estrutura similar à página final
  if (isPageLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <Skeleton className="h-24 w-full rounded-lg" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Se usuário não tem empresas, mostrar tela sem empresas
  if (!isLoading && user && userCompanies.length === 0) {
    return <NoCompaniesAvailable />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Ready to grow? Discover new tasks and seize the opportunity!
          </p>
        </div>
        
        <UserInfoHeader />

        <DashboardMetrics />

        <DashboardChallenges />
        
        <LeaderBoard />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
