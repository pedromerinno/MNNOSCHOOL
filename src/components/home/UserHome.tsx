
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { HelpButton } from "./HelpButton";

export const UserHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserCompanies, selectedCompany } = useCompanies();
  const [isLoading, setIsLoading] = useState(false);
  
  // Ensure user companies are loaded when navigating to home
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          console.log('UserHome: Fetching user companies on home page');
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('Error fetching user companies on home page:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

  useEffect(() => {
    if (selectedCompany) {
      console.log('UserHome: Selected company loaded:', selectedCompany.nome);
    }
  }, [selectedCompany]);
  
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
