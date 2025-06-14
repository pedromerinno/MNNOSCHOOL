
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
  const { user, userProfile, loading: authLoading } = useAuth();
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
      authLoading,
      showCompanyDialog,
      showProfileDialog,
      hasUserCompanies: userCompanies.length > 0
    });
  }, [user, userProfile, userCompanies, selectedCompany, isLoading, authLoading, showCompanyDialog, showProfileDialog]);

  // Mostrar skeleton enquanto carrega dados iniciais
  if (pageLoadingState || isLoading || authLoading) {
    console.log("[IndexContent] Showing skeleton - loading state");
    return <IndexSkeleton />;
  }

  // Se não tem usuário logado ainda, continuar mostrando skeleton
  if (!user) {
    console.log("[IndexContent] No user - showing skeleton");
    return <IndexSkeleton />;
  }

  // Se não tem perfil de usuário ainda, continuar mostrando skeleton
  if (!userProfile) {
    console.log("[IndexContent] No user profile - showing skeleton");
    return <IndexSkeleton />;
  }

  // CRITICAL CHECK: If user has companies, NEVER show company dialog
  const shouldShowCompanyDialog = showCompanyDialog && userCompanies.length === 0 && !userProfile.super_admin;
  
  console.log("[IndexContent] Dialog decision:", {
    showCompanyDialog,
    userCompaniesLength: userCompanies.length,
    shouldShowCompanyDialog,
    isSuperAdmin: userProfile.super_admin
  });

  // Se é super admin ou tem empresas, mostrar home normal
  if (userProfile.super_admin || userCompanies.length > 0) {
    console.log("[IndexContent] User has access - showing UserHome");
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
  if (!userProfile.super_admin && userCompanies.length === 0) {
    console.log("[IndexContent] User has no companies - showing NoCompaniesAvailable");
    return <NoCompaniesAvailable />;
  }

  // Default case - should not reach here but showing home as fallback
  console.log("[IndexContent] Default case - showing UserHome with dialogs");
  return (
    <div className="min-h-screen bg-background">
      <UserHome />
      
      {/* ONLY show company dialog if user truly has no companies */}
      {shouldShowCompanyDialog && (
        <CompanySelectionDialog 
          open={shouldShowCompanyDialog}
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
