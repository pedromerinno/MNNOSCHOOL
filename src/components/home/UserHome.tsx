
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
  const { getUserCompanies, userCompanies, selectedCompany, selectCompany } = useCompanies();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ensure user companies are loaded when navigating to home
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (!user?.id) return;
      
      try {
        console.log('UserHome: Fetching companies for user:', user.id);
        const companies = await getUserCompanies(user.id);
        console.log('UserHome: Fetched companies count:', companies?.length || 0);
        
        // If we have companies but no selected company, select the first one
        if (companies?.length > 0 && !selectedCompany) {
          console.log('UserHome: Auto-selecting first company:', companies[0].nome);
          selectCompany(user.id, companies[0]);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error fetching user companies on home page:', error);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      fetchUserCompanies();
    }
  }, [user, getUserCompanies, selectedCompany, userCompanies, selectCompany, isInitialized]);
  
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
