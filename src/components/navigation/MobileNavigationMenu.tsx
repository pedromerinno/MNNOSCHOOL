
import { useLocation } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { FocusTimer } from "./FocusTimer";
import { NotificationButton } from "./NotificationButton";
import { MobileMenu } from "./MobileMenu";
import { CompanySelector } from "./CompanySelector";
import { useAuth } from "@/contexts/AuthContext";

export const MobileNavigationMenu = () => {
  const { userProfile } = useAuth();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b shadow-sm bg-[#F8F7F4] dark:bg-[#191919] lg:hidden pt-safe-top">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <MobileMenu />
          <CompanySelector />
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <SearchBar />
          <FocusTimer />
          <NotificationButton />
        </div>
      </div>
    </header>
  );
};
