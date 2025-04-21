
import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { LoadingHome } from "@/components/home/LoadingHome";
import { CompanyCreationDialog } from "@/components/home/CompanyCreationDialog";
import { useCompanyDialog } from "@/hooks/home/useCompanyDialog";
import { useCompanyInitialization } from "@/hooks/home/useCompanyInitialization";

const NoCompaniesAvailable = lazy(() => import("@/components/home/NoCompaniesAvailable").then(module => ({ default: module.NoCompaniesAvailable })));
const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ default: module.UserHome })));

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user } = useAuth();
  const { userCompanies, isLoading, selectedCompany } = useCompanies();
  const { getInitialSelectedCompany } = useCompanyCache();
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  const {
    showCompanyDialog,
    setShowCompanyDialog,
    handleCompanyCreated,
    handleCompanyTypeSelect
  } = useCompanyDialog();

  // Initialize company data
  useCompanyInitialization(setShowCompanyDialog);
  
  // Handle page loading state
  useEffect(() => {
    if (hasCachedCompany) {
      setTimeout(() => setIsPageLoading(false), 50);
      return;
    }
    
    if (selectedCompany || (!isLoading && hasCachedCompany)) {
      setIsPageLoading(false);
    }
    
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        console.log("[Index] Finalizing loading by timeout of security");
        setIsPageLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, selectedCompany, isPageLoading, hasCachedCompany]);

  if (hasCachedCompany && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingHome />}>
          <UserHome />
        </Suspense>
      </div>
    );
  }

  if ((isPageLoading && !hasCachedCompany) || (user && isLoading && !hasCachedCompany)) {
    return <LoadingHome />;
  }

  if (user && !isLoading && userCompanies.length === 0) {
    return (
      <>
        <CompanyCreationDialog
          open={showCompanyDialog}
          onOpenChange={setShowCompanyDialog}
          onCompanyCreated={handleCompanyCreated}
          onCompanyTypeSelect={handleCompanyTypeSelect}
        />
        
        <div className="min-h-screen bg-background">
          <Suspense fallback={<LoadingHome />}>
            <NoCompaniesAvailable />
          </Suspense>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingHome />}>
        <UserHome />
      </Suspense>
    </div>
  );
};

export default Index;
