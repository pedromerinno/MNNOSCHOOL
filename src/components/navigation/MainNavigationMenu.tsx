
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
  const { user } = useAuth();
  const { userCompanies } = useCompanies();

  // Log para debug do número de empresas carregadas
  useEffect(() => {
    if (userCompanies.length > 0) {
      console.log(`MainNavigationMenu: ${userCompanies.length} empresas carregadas`);
    }
  }, [userCompanies.length]);

  return (
    <header className="w-full border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-16">
          <div className="flex items-center">
            <CompanySelector />
          </div>
          
          <NavMenuLinks />
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <SearchBar />
          
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
