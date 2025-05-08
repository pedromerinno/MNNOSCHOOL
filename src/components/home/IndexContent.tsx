
import { useCompanyInitialization } from "@/hooks/home/useCompanyInitialization";
import { IndexLoadingState } from "./IndexLoadingState";
import { HomeContent } from "./HomeContent";
import { EmptyCompanyState } from "./EmptyCompanyState";
import { UserProfileDialog } from "@/components/profile/UserProfileDialog";
import { CompanySelectionDialog } from "@/components/profile/CompanySelectionDialog";
import { useProfileCompletionCheck } from "@/hooks/home/useProfileCompletionCheck";

export const IndexContent = () => {
  const {
    isPageLoading,
    showCompanyDialog: legacyShowCompanyDialog,
    setShowCompanyDialog: legacySetShowCompanyDialog,
    userCompanies,
    isLoading,
    user,
    handleCompanyCreated,
    handleCompanyTypeSelect,
    forceGetUserCompanies,
    hasCachedCompany
  } = useCompanyInitialization();

  const {
    showProfileDialog,
    setShowProfileDialog,
    showCompanyDialog,
    setShowCompanyDialog,
    handleProfileComplete,
    handleCompanyComplete,
    isChecking
  } = useProfileCompletionCheck();

  // Loading state
  if ((isPageLoading && !hasCachedCompany) || (user && isLoading && !hasCachedCompany) || isChecking) {
    return <IndexLoadingState />;
  }

  // No companies state
  if (user && !isLoading && userCompanies.length === 0) {
    return (
      <>
        <UserProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          onComplete={handleProfileComplete}
        />
        
        <CompanySelectionDialog
          open={showCompanyDialog}
          onOpenChange={setShowCompanyDialog}
          onComplete={handleCompanyComplete}
        />
        
        <EmptyCompanyState
          showDialog={legacyShowCompanyDialog && !showProfileDialog && !showCompanyDialog}
          onOpenChange={legacySetShowCompanyDialog}
          onCompanyTypeSelect={handleCompanyTypeSelect}
          onCompanyCreated={handleCompanyCreated}
          userId={user?.id}
          forceGetUserCompanies={forceGetUserCompanies}
        />
      </>
    );
  }

  // Default state with companies
  return (
    <>
      <UserProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onComplete={handleProfileComplete}
      />
      
      <HomeContent />
    </>
  );
};
