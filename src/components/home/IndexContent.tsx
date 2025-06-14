
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyInitialization } from "@/hooks/home/useCompanyInitialization";
import { usePageLoadingState } from "@/hooks/home/usePageLoadingState";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { UserHome } from "@/components/home/UserHome";
import { IndexSkeleton } from "@/components/home/IndexSkeleton";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";
import { CompanySelectionDialog } from "@/components/home/CompanySelectionDialog";
import { UserProfileDialog } from "@/components/home/UserProfileDialog";

export const IndexContent = () => {
  const { user, userProfile } = useAuth();
  const { selectedCompany, isLoading, getUserCompanies, userCompanies, fetchCount } = useCompanies();
  
  const {
    isPageLoading,
    showCompanyDialog,
    setShowCompanyDialog,
    showProfileDialog,
    setShowProfileDialog,
    handleCompanyCreated,
    handleCompanyTypeSelect,
    handleProfileComplete,
    handleCompanyComplete,
    forceGetUserCompanies,
    hasCachedCompany
  } = useCompanyInitialization();

  const { isPageLoading: pageLoadingState } = usePageLoadingState(
    hasCachedCompany,
    selectedCompany,
    isLoading,
    fetchCount,
    isPageLoading
  );

  // Mostrar skeleton enquanto carrega dados iniciais
  if (pageLoadingState || isLoading || !user) {
    return <IndexSkeleton />;
  }

  // Se não há empresas depois do carregamento inicial
  if (!isLoading && user && userCompanies.length === 0) {
    return <NoCompaniesAvailable />;
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigationMenu />
      <UserHome />
      
      <CompanySelectionDialog 
        open={showCompanyDialog}
        onOpenChange={setShowCompanyDialog}
        onCompanyCreated={handleCompanyCreated}
        onCompanyTypeSelect={handleCompanyTypeSelect}
      />
      
      <UserProfileDialog 
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onProfileComplete={handleProfileComplete}
      />
    </div>
  );
};
