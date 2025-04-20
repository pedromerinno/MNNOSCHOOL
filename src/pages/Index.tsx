
import { useState, useEffect } from "react";
import { UserHome } from "@/components/home/UserHome";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { userCompanies, isLoading, fetchCount } = useCompanies();
  const { user } = useAuth();

  // Simular um carregamento mínimo para garantir que a UI não pisque,
  // mas também garantir que esperamos pelo menos uma tentativa de carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only set isPageLoading to false if companies have been fetched at least once
      // or if there was an error (to avoid infinite loading)
      if (fetchCount > 0 || !isLoading) {
        setIsPageLoading(false);
      }
    }, 1500); // Increased from 500ms to 1500ms to ensure companies have time to load
    
    return () => clearTimeout(timer);
  }, [isLoading, fetchCount]);

  // Force a minimum loading time to avoid flicker
  if (isPageLoading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          <div className="flex justify-center">
            <Skeleton className="h-8 w-48 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-3/4 mx-auto rounded-lg" />
            <div className="flex justify-center mt-6">
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Only show NoCompaniesAvailable if we've finished loading AND there are no companies
  // This prevents the "no companies" message from showing during initial loading
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
