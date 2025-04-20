
import { useState, useEffect } from "react";
import { UserHome } from "@/components/home/UserHome";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { userCompanies, isLoading, fetchCount, selectedCompany } = useCompanies();
  const { user, userProfile } = useAuth();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  // Removida a verificação baseada em tempo, usando apenas estado real
  useEffect(() => {
    // Se temos empresa selecionada ou os dados já foram carregados, não estamos mais carregando
    if (selectedCompany || (fetchCount > 0 && !isLoading)) {
      setIsPageLoading(false);
    }
  }, [isLoading, fetchCount, selectedCompany]);

  // Mostrar apenas um skeleton simples durante carregamento
  if (isPageLoading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          <div className="flex justify-center">
            <Skeleton className="h-8 w-36 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="flex justify-center mt-4">
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar NoCompaniesAvailable apenas quando terminamos de carregar E não há empresas
  if (user && !isLoading && userCompanies.length === 0) {
    return <NoCompaniesAvailable />;
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHome />
    </div>
  );
};

export default Index;
