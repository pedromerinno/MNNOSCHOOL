
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { AdminFloatingActionButton } from "../admin/AdminFloatingActionButton";
import { CompanySelectionDialog } from "./CompanySelectionDialog";
import { useEffect, useState } from "react";

export const UserHome = () => {
  const { user, userProfile } = useAuth();
  const { userCompanies, isLoading, forceGetUserCompanies } = useCompanies();
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [hasCheckedCompanies, setHasCheckedCompanies] = useState(false);

  // Verificar se deve mostrar o diálogo de empresa
  useEffect(() => {
    console.log("[UserHome] Checking company dialog conditions:", {
      user: !!user,
      userProfile: !!userProfile,
      userCompaniesLength: userCompanies.length,
      isLoading,
      hasCheckedCompanies,
      isSuperAdmin: userProfile?.super_admin
    });

    // Não verificar se ainda está carregando ou se já verificou
    if (isLoading || hasCheckedCompanies || !user || !userProfile) {
      return;
    }

    // Se é super admin, não precisa de empresa
    if (userProfile.super_admin) {
      setHasCheckedCompanies(true);
      return;
    }

    // Se não tem empresas, mostrar diálogo
    if (userCompanies.length === 0) {
      console.log("[UserHome] User has no companies, showing dialog");
      setShowCompanyDialog(true);
      setHasCheckedCompanies(true);
    } else {
      setHasCheckedCompanies(true);
    }
  }, [user, userProfile, userCompanies.length, isLoading, hasCheckedCompanies]);

  const handleCompanyCreated = () => {
    console.log("[UserHome] Company created, closing dialog");
    setShowCompanyDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
    }
  };

  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log("[UserHome] Company type selected:", isExisting ? "existing" : "new");
  };
  
  return (
    <>
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
        <main className="container mx-auto px-4 py-8">
          <WelcomeSection />
          <QuickLinks />
          <DashboardWidgets />
        </main>
        <Footer />
        <AdminFloatingActionButton />
      </div>

      <CompanySelectionDialog
        open={showCompanyDialog}
        onOpenChange={setShowCompanyDialog}
        onCompanyTypeSelect={handleCompanyTypeSelect}
        onCompanyCreated={handleCompanyCreated}
        userId={user?.id}
        forceGetUserCompanies={forceGetUserCompanies}
      />
    </>
  );
};
