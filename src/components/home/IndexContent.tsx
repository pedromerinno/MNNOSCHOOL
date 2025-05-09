
import { useCompanyInitialization } from "@/hooks/home/useCompanyInitialization";
import { IndexLoadingState } from "./IndexLoadingState";
import { HomeContent } from "./HomeContent";
import { EmptyCompanyState } from "./EmptyCompanyState";

export const IndexContent = () => {
  const {
    isPageLoading,
    showCompanyDialog,
    setShowCompanyDialog,
    userCompanies,
    isLoading,
    user,
    handleCompanyCreated,
    handleCompanyTypeSelect,
    forceGetUserCompanies,
    hasCachedCompany
  } = useCompanyInitialization();

  // Loading state
  if ((isPageLoading && !hasCachedCompany) || (user && isLoading && !hasCachedCompany)) {
    return <IndexLoadingState />;
  }

  // No companies state
  if (user && !isLoading && userCompanies.length === 0) {
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

  // Default state with companies
  return <HomeContent />;
};
