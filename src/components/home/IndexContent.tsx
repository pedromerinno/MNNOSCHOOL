
import { useCompanyInitialization } from "@/hooks/home/useCompanyInitialization";
import { useProfileCompletionCheck } from "@/hooks/home/useProfileCompletionCheck";
import { IndexLoadingState } from "./IndexLoadingState";
import { HomeContent } from "./HomeContent";
import { EmptyCompanyState } from "./EmptyCompanyState";
import { UserProfileDialog } from "./UserProfileDialog";
import { CompanySelectionDialog } from "./CompanySelectionDialog";
import { useRef } from "react";

export const IndexContent = () => {
  const {
    isPageLoading,
    userCompanies,
    isLoading,
    user,
    handleCompanyCreated,
    handleCompanyTypeSelect,
    forceGetUserCompanies,
    hasCachedCompany
  } = useCompanyInitialization();

  const hasRenderedDialogs = useRef(false);

  const {
    showProfileDialog,
    setShowProfileDialog,
    showCompanyDialog,
    setShowCompanyDialog,
    handleProfileComplete,
    handleCompanyComplete
  } = useProfileCompletionCheck();

  // Loading state
  if ((isPageLoading && !hasCachedCompany) || (user && isLoading && !hasCachedCompany)) {
    return <IndexLoadingState />;
  }

  // No companies state
  if (user && !isLoading && userCompanies.length === 0) {
    hasRenderedDialogs.current = true;
    return (
      <>
        {/* User Profile Dialog */}
        <UserProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          onProfileComplete={handleProfileComplete}
        />
        
        {/* Company Selection Dialog */}
        <CompanySelectionDialog
          open={showCompanyDialog}
          onOpenChange={setShowCompanyDialog}
          onCompanyTypeSelect={handleCompanyTypeSelect}
          onCompanyCreated={handleCompanyComplete}
          userId={user?.id}
          forceGetUserCompanies={forceGetUserCompanies}
        />
        
        <EmptyCompanyState
          showDialog={false} // We're handling dialogs with our custom hooks now
          onOpenChange={setShowCompanyDialog}
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
      {/* User Profile Dialog - visible only when profile is incomplete */}
      <UserProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onProfileComplete={handleProfileComplete}
      />
      
      <HomeContent />
    </>
  );
};
