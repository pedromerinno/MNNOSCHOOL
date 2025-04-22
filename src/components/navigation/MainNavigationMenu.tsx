import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NavMenuLinks } from "@/components/navigation/NavMenuLinks";
import { SearchBar } from "@/components/navigation/SearchBar";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { NotificationButton } from "@/components/navigation/NotificationButton";
import { UserNavigation } from "@/components/navigation/UserNavigation";
import { AuthButtons } from "@/components/navigation/AuthButtons";
import { CompanySelector } from "@/components/navigation/CompanySelector";
import { memo } from "react";

export const MainNavigationMenu = memo(() => {
  const { user, userProfile } = useAuth();

  const getAdminLabel = () => {
    if (userProfile?.super_admin) {
      return "Super Admin";
    }
    return "Admin";
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full border-b shadow-sm bg-[#191919] dark:bg-[#191919]"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <CompanySelector />
          </div>
          
          <NavMenuLinks adminLabel={getAdminLabel()} />
        </div>
        
        <div className="flex items-center space-x-3">
          <SearchBar />
          
          <ThemeToggle />
          
          {user ? (
            <UserNavigation />
          ) : (
            <AuthButtons />
          )}
          
          <NotificationButton />
        </div>
      </div>
    </header>
  );
});

MainNavigationMenu.displayName = 'MainNavigationMenu';
