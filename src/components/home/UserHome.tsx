
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { HelpButton } from "./HelpButton";
import { NoCompaniesAvailable } from "./NoCompaniesAvailable";

export const UserHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserCompanies, selectedCompany, userCompanies } = useCompanies();
  
  // Apenas carregar as empresas do usuário, sem forçar seleção
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        try {
          // Usar false como segundo parâmetro para não mostrar loading
          // e não forçar seleção de empresa
          await getUserCompanies(user.id, false);
        } catch (error) {
          console.error('Error fetching user companies on home page:', error);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);
  
  // The no companies check is already handled at the Index.tsx level,
  // but we'll add it here as a fallback just in case
  if (user && userCompanies.length === 0) {
    return <NoCompaniesAvailable />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <WelcomeSection />
        <QuickLinks />
        <DashboardWidgets />
      </main>

      <Footer />
      <HelpButton />
    </div>
  );
};
