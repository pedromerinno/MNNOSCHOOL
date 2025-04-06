
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
        setIsLoading(true);
        try {
          const companies = await getUserCompanies(user.id);
          console.log('UserHome: Companies fetched successfully:', companies?.length || 0);
        } catch (error) {
          console.error('Error fetching user companies on home page:', error);
          // Don't show error toast on first load, as it's already handled in WelcomeSection
        } finally {
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
