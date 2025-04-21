
import { lazy, Suspense } from "react";
import { useIndexPage } from "@/hooks/useIndexPage";
import { LoadingPlaceholder } from "@/components/home/LoadingPlaceholder";
import { CompanyRegistrationForm } from "@/components/home/CompanyRegistrationForm";

// Lazy-load components to improve initial loading time
const NoCompaniesAvailable = lazy(() => import("@/components/home/NoCompaniesAvailable").then(module => ({ default: module.NoCompaniesAvailable })));
const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ default: module.UserHome })));

const Index = () => {
  const { isPageLoading, showCompanyForm, userCompanies } = useIndexPage();

  // Show loading placeholder during initial loading
  if (isPageLoading) {
    console.log("[Index] Mostrando estado de carregamento inicial");
    return <LoadingPlaceholder />;
  }

  // Show company registration form only when needed
  if (showCompanyForm) {
    console.log("[Index] Renderizando formulário de cadastro de empresa");
    return <CompanyRegistrationForm />;
  }

  // Show home page with companies
  console.log("[Index] Renderizando página inicial com empresas");
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingPlaceholder />}>
        <UserHome />
      </Suspense>
    </div>
  );
};

export default Index;
