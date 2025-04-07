
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NavMenuLinks } from "@/components/navigation/NavMenuLinks";
import { SearchBar } from "@/components/navigation/SearchBar";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { NotificationButton } from "@/components/navigation/NotificationButton";
import { UserNavigation } from "@/components/navigation/UserNavigation";
import { AuthButtons } from "@/components/navigation/AuthButtons";
import { CompanySelector } from "@/components/navigation/CompanySelector";
import { useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";

export const MainNavigationMenu = () => {
  const { user, userProfile } = useAuth();
  const { userCompanies } = useCompanies();

  // Log para debug do número de empresas carregadas
  useEffect(() => {
    if (userCompanies.length > 0) {
      console.log(`MainNavigationMenu: ${userCompanies.length} empresas carregadas`);
    }
  }, [userCompanies.length]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <CompanySelector />
          </div>
          
          <NavMenuLinks />
        </div>
        
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          <SearchBar />
          
          {userProfile?.isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-2">
              Admin
            </Link>
          )}
          
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
};
