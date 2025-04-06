
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { HelpButton } from "./HelpButton";
import { toast } from "sonner";

export const UserHome = () => {
  const { user } = useAuth();
  const { getUserCompanies, selectedCompany } = useCompanies();
  const [isLoading, setIsLoading] = useState(true);
  
  // Ensure user companies are loaded when navigating to home
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        try {
          console.log('UserHome: Fetching user companies');
          setIsLoading(true);
          const companies = await getUserCompanies(user.id);
          console.log('UserHome: Fetched companies count:', companies.length);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching user companies on home page:', error);
          toast.error("Erro ao carregar empresas", { 
            description: "Não foi possível carregar as empresas associadas ao seu perfil."
          });
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);
  
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
