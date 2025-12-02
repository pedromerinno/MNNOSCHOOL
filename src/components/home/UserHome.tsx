
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

  // Calcular se deve mostrar o diálogo de empresa
  const shouldShowDialog = !isLoading && 
                          user && 
                          userProfile && 
                          !userProfile.super_admin && 
                          userCompanies.length === 0;

  // Sincronizar estado do diálogo com o cálculo
  useEffect(() => {
    setShowCompanyDialog(shouldShowDialog);
  }, [shouldShowDialog]);

  const handleCompanyCreated = () => {
    setShowCompanyDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
    }
  };

  const handleCompanyTypeSelect = (isExisting: boolean) => {
    // Handler para seleção de tipo de empresa
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
        open={shouldShowDialog}
        onOpenChange={(open) => {
          // Só permitir fechar se o usuário é super admin ou tem empresas
          if (!open && (userProfile?.super_admin || userCompanies.length > 0)) {
            setShowCompanyDialog(false);
          }
        }}
        onCompanyTypeSelect={handleCompanyTypeSelect}
        onCompanyCreated={handleCompanyCreated}
        userId={user?.id}
        forceGetUserCompanies={forceGetUserCompanies}
      />
    </>
  );
};
