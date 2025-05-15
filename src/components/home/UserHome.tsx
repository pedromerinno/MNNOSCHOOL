
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { NoCompaniesAvailable } from "./NoCompaniesAvailable";
import { AdminFloatingActionButton } from "../admin/AdminFloatingActionButton";

// Making UserHome a named export AND also a default export to fix the import issues
export const UserHome = () => {
  const { user } = useAuth();
  const { getUserCompanies, selectedCompany, userCompanies } = useCompanies();
  
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        try {
          console.log("[UserHome] Buscando empresas do usuário sem forçar seleção");
          await getUserCompanies(user.id, false);
        } catch (error) {
          console.error('Error fetching user companies on home page:', error);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);
  
  if (user && userCompanies.length === 0) {
    console.log("[UserHome] Nenhuma empresa disponível, mostrando NoCompaniesAvailable");
    return <NoCompaniesAvailable />;
  }
  
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <main className="container mx-auto px-4 py-8">
        <WelcomeSection />
        <QuickLinks />
        <DashboardWidgets />
      </main>
      <Footer />
      <AdminFloatingActionButton />
    </div>
  );
};

// Add default export to fix lazy loading
export default UserHome;
