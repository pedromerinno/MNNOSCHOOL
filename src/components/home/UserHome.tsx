
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { AdminFloatingActionButton } from "../admin/AdminFloatingActionButton";

export const UserHome = () => {
  const { user } = useAuth();
  
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
