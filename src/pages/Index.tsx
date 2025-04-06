
import { useState, useEffect } from "react";
import { UserHome } from "@/components/home/UserHome";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Simular um carregamento mínimo para garantir que a UI não pisque
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      <UserHome />
    </div>
  );
};

export default Index;
