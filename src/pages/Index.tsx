
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

  // Reduzida a duração mínima do carregamento para minimizar flickering
  useEffect(() => {
    // Definir um tempo mínimo de carregamento mais curto para reduzir a espera
    const minLoadTime = isAdmin ? 1200 : 800;
    
    const timer = setTimeout(() => {
      if (selectedCompany || fetchCount > 0 || !isLoading) {
        setIsPageLoading(false);
      }
    }, minLoadTime);
    
    return () => clearTimeout(timer);
  }, [isLoading, fetchCount, selectedCompany, isAdmin]);

  // Show a simpler loading state
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

  // Only show NoCompaniesAvailable if we've finished loading AND there are no companies
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
