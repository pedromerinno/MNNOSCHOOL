
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyInitialization } from "@/hooks/home/useCompanyInitialization";
import { usePageLoadingState } from "@/hooks/home/usePageLoadingState";
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

  // Debug log para verificar o estado
  useEffect(() => {
    console.log("[IndexContent] Debug state:", {
      user: user?.email,
      userProfile: userProfile?.display_name,
      isSuperAdmin: userProfile?.super_admin,
      userCompaniesCount: userCompanies?.length || 0,
      selectedCompany: selectedCompany?.nome,
      isLoading,
      showCompanyDialog,
      showProfileDialog
    });
  }, [user, userProfile, userCompanies, selectedCompany, isLoading, showCompanyDialog, showProfileDialog]);

  // Mostrar skeleton enquanto carrega dados iniciais
  if (pageLoadingState || isLoading || !user) {
    return <IndexSkeleton />;
  }

  // Se é super admin ou tem empresas, mostrar home normal
  if (user && userProfile && (userProfile.super_admin || userCompanies.length > 0)) {
    return (
      <div className="min-h-screen bg-background">
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
  }

  // Se não é super admin e não tem empresas, mostrar tela de empresas não disponíveis
  if (!isLoading && user && userProfile && !userProfile.super_admin && userCompanies.length === 0) {
    return <NoCompaniesAvailable />;
  }

  // Default case
  return (
    <div className="min-h-screen bg-background">
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
