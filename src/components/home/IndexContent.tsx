
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyInitialization } from "@/hooks/home/useCompanyInitialization";
import { UserHome } from "@/components/home/UserHome";
import { IndexSkeleton } from "@/components/home/IndexSkeleton";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";
import { CompanySelectionDialog } from "@/components/home/CompanySelectionDialog";
import { UserProfileDialog } from "@/components/home/UserProfileDialog";

export const IndexContent = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { selectedCompany, isLoading, userCompanies } = useCompanies();
  
  const {
    showCompanyDialog,
    setShowCompanyDialog,
    showProfileDialog,
    setShowProfileDialog,
    handleCompanyCreated,
    handleCompanyTypeSelect,
    handleProfileComplete,
    handleCompanyComplete,
    forceGetUserCompanies
  } = useCompanyInitialization();

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
      showProfileDialog
    });
  }, [user, userProfile, userCompanies, selectedCompany, isLoading, authLoading, showCompanyDialog, showProfileDialog]);

  // SIMPLIFIED LOADING LOGIC - only show skeleton for initial auth loading
  if (authLoading && !user) {
    console.log("[IndexContent] Showing skeleton - auth loading and no user");
    return <IndexSkeleton />;
  }

  // If no user, redirect to login (this should be handled by ProtectedRoute)
  if (!user) {
    console.log("[IndexContent] No user - this should be handled by ProtectedRoute");
    return <IndexSkeleton />;
  }

  // Wait for user profile to load, but with timeout
  if (!userProfile && authLoading) {
    console.log("[IndexContent] Waiting for user profile");
    return <IndexSkeleton />;
  }

  // If user profile is still null after auth loading, create a minimal profile state
  const effectiveUserProfile = userProfile || {
    id: user.id,
    email: user.email,
    display_name: user.email?.split('@')[0] || 'User',
    is_admin: false,
    super_admin: false,
    primeiro_login: true
  };

  console.log("[IndexContent] Using effective user profile:", effectiveUserProfile);

  // Se é super admin ou tem empresas, mostrar home normal
  if (effectiveUserProfile.super_admin || userCompanies.length > 0) {
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
  console.log("[IndexContent] User has no companies - showing NoCompaniesAvailable");
  return (
    <div className="min-h-screen bg-background">
      <NoCompaniesAvailable />
      
      {showCompanyDialog && (
        <CompanySelectionDialog 
          open={showCompanyDialog}
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
