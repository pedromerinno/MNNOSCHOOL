
import { useEffect } from "react";
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

  // CRITICAL: Check user companies length
  const hasUserCompanies = userCompanies && userCompanies.length > 0;

  // Debug log para verificar o estado
  useEffect(() => {
    console.log("[IndexContent] CRITICAL STATE CHECK:", {
      user: user?.email,
      userProfile: userProfile?.display_name,
      isSuperAdmin: userProfile?.super_admin,
      userCompaniesCount: userCompanies?.length || 0,
      hasUserCompanies,
      selectedCompany: selectedCompany?.nome,
      isLoading,
      showCompanyDialog,
      showProfileDialog,
      pageLoadingState
    });
  }, [user, userProfile, userCompanies, selectedCompany, isLoading, showCompanyDialog, showProfileDialog, hasUserCompanies, pageLoadingState]);

  // Mostrar skeleton enquanto carrega dados iniciais
  if (pageLoadingState || isLoading || !user) {
    console.log("[IndexContent] Showing skeleton - loading state");
    return <IndexSkeleton />;
  }

  // ABSOLUTE CRITICAL: Never show company dialog if user has companies
  const finalShowCompanyDialog = hasUserCompanies ? false : showCompanyDialog;
  
  console.log("[IndexContent] FINAL DIALOG DECISION:", {
    showCompanyDialog,
    hasUserCompanies,
    finalShowCompanyDialog,
    userCompaniesLength: userCompanies?.length || 0
  });

  // Se é super admin ou tem empresas, mostrar home normal SEM DIÁLOGOS DE EMPRESA
  if (user && userProfile && (userProfile.super_admin || hasUserCompanies)) {
    console.log("[IndexContent] User has admin access or companies - showing normal home");
    return (
      <div className="min-h-screen bg-background">
        <UserHome />
        
        {/* Profile dialog can show for users with companies */}
        {showProfileDialog && (
          <UserProfileDialog 
            open={showProfileDialog}
            onOpenChange={setShowProfileDialog}
            onProfileComplete={handleProfileComplete}
          />
        )}
      </div>
    );
  }

  // Se não é super admin e não tem empresas, mostrar tela de empresas não disponíveis
  if (!isLoading && user && userProfile && !userProfile.super_admin && !hasUserCompanies) {
    console.log("[IndexContent] User has no companies and no admin access - showing no companies available");
    return <NoCompaniesAvailable />;
  }

  // Default case - show home with dialogs only if user has no companies
  console.log("[IndexContent] Default case - showing home with conditional dialogs");
  return (
    <div className="min-h-screen bg-background">
      <UserHome />
      
      {/* CRITICAL: ONLY show company dialog if user truly has NO companies */}
      {finalShowCompanyDialog && !hasUserCompanies && (
        <CompanySelectionDialog 
          open={finalShowCompanyDialog}
          onOpenChange={setShowCompanyDialog}
          onCompanyCreated={handleCompanyCreated}
          onCompanyTypeSelect={handleCompanyTypeSelect}
        />
      )}
      
      {showProfileDialog && (
        <UserProfileDialog 
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          onProfileComplete={handleProfileComplete}
        />
      )}
    </div>
  );
};
