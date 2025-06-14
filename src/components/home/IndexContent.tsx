
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useIndexContentState } from "@/hooks/home/useIndexContentState";
import { UserHome } from "@/components/home/UserHome";
import { IndexSkeleton } from "@/components/home/IndexSkeleton";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";
import { CompanySelectionDialog } from "@/components/home/CompanySelectionDialog";
import { UserProfileDialog } from "@/components/home/UserProfileDialog";

export const IndexContent = () => {
  const { user } = useAuth();
  const { forceGetUserCompanies } = useCompanies();
  
  const {
    isPageReady,
    showCompanyDialog,
    setShowCompanyDialog,
    showProfileDialog,
    setShowProfileDialog,
    handleProfileComplete,
    handleCompanyComplete,
    shouldShowContent,
    shouldShowNoCompaniesState
  } = useIndexContentState();

  // Mostrar skeleton apenas enquanto não tem dados básicos
  if (!isPageReady || !user) {
    return <IndexSkeleton />;
  }

  // Sempre mostrar o conteúdo principal quando a página está pronta
  return (
    <div className="min-h-screen bg-background">
      <UserHome />
      
      <CompanySelectionDialog 
        open={showCompanyDialog}
        onOpenChange={setShowCompanyDialog}
        onCompanyCreated={() => {
          handleCompanyComplete();
          if (user?.id) {
            forceGetUserCompanies(user.id);
          }
        }}
        onCompanyTypeSelect={() => {}}
      />
      
      <UserProfileDialog 
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onProfileComplete={handleProfileComplete}
      />
      
      {shouldShowNoCompaniesState && <NoCompaniesAvailable />}
    </div>
  );
};
