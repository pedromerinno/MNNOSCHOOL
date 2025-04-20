
import { useState, useEffect } from "react";
import { UserHome } from "@/components/home/UserHome";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { userCompanies, isLoading, fetchCount, selectedCompany } = useCompanies();
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  
  // Verificação imediata do cache para evitar o skeleton se já temos dados
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // Melhor controle do estado de carregamento da página
  useEffect(() => {
    // Se já temos empresa em cache, reduzir tempo de loading ou até pular
    if (hasCachedCompany) {
      // Definir um timeout mais curto para dar tempo de transição
      setTimeout(() => setIsPageLoading(false), 300);
      return;
    }
    
    // Finaliza o carregamento quando temos uma empresa selecionada ou os dados já foram carregados
    if (selectedCompany || (fetchCount > 0 && !isLoading)) {
      setIsPageLoading(false);
    }
    
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizando loading por timeout de segurança");
        setIsPageLoading(false);
      }
    }, 2000); // 2 segundos
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchCount, selectedCompany, isPageLoading, hasCachedCompany]);

  // Mostrar skeleton durante carregamento, mas pular se já temos dados em cache
  if ((isPageLoading && !hasCachedCompany) || (user && isLoading && !hasCachedCompany)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-10 w-40 rounded-full" />
            <Skeleton className="h-4 w-60 rounded-full" />
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
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
