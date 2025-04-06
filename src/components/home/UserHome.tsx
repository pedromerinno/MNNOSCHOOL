
import { useNavigate } from "react-router-dom";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { HelpButton } from "./HelpButton";

export const UserHome = () => {
  const navigate = useNavigate();
  
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
