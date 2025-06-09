
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { AdminFloatingActionButton } from "../admin/AdminFloatingActionButton";

export const UserHome = () => {
  const { user } = useAuth();
  
  // Simplified - no company fetching here to prevent loops
  useEffect(() => {
    if (user?.id) {
      console.log("[UserHome] User authenticated, rendering home");
    }
  }, [user?.id]);
  
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
