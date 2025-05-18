
import { Suspense, lazy, useState, useEffect } from "react";
import { IndexLoadingState } from "./IndexLoadingState";
import { useCompanies } from "@/hooks/useCompanies";
import { EmptyCompanyState } from "./EmptyCompanyState";
import { useCompanyInitialization } from "@/hooks/home/useCompanyInitialization";

const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ default: module.UserHome })));

export const IndexContent = () => {
  const { userCompanies, isLoading, user, forceGetUserCompanies } = useCompanies();
  const { 
    showCompanyDialog, 
    setShowCompanyDialog, 
    handleCompanyCreated, 
    handleCompanyTypeSelect 
  } = useCompanyInitialization();
  const [hasLoadedData, setHasLoadedData] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasLoadedData(true);
    }
  }, [isLoading]);

  // Mostra o estado de loading enquanto os dados estão sendo carregados
  if (!hasLoadedData) {
    return (
      <div className="min-h-screen bg-background">
        <IndexLoadingState />
      </div>
    );
  }

  // Se não tem empresas, mostra o componente EmptyCompanyState
  if (hasLoadedData && userCompanies.length === 0) {
    return (
      <EmptyCompanyState
        showDialog={showCompanyDialog}
        onOpenChange={setShowCompanyDialog}
        onCompanyTypeSelect={handleCompanyTypeSelect}
        onCompanyCreated={handleCompanyCreated}
        userId={user?.id}
        forceGetUserCompanies={forceGetUserCompanies}
      />
    );
  }

  // Se tem empresas, mostra o componente UserHome
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <Suspense fallback={<IndexLoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};
