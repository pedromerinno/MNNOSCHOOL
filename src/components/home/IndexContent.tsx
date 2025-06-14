
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

  // Mostrar skeleton enquanto dados não estão prontos
  if (!isPageReady || !user) {
    return <IndexSkeleton />;
  }

  // Mostrar conteúdo principal se usuário pode acessar
  if (shouldShowContent) {
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
      </div>
    );
  }

  // Mostrar estado de "sem empresas" se aplicável
  if (shouldShowNoCompaniesState) {
    return <NoCompaniesAvailable />;
  }

  // Fallback para casos não cobertos - mostrar skeleton
  return <IndexSkeleton />;
};
