
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CompanySelector } from "./CompanySelector";
import { UserNavigation } from "./UserNavigation";
import { AuthButtons } from "./AuthButtons";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationButton } from "./NotificationButton";
import { NavMenuLinks } from "./NavMenuLinks";
import { useCompanies } from "@/hooks/useCompanies";

export const DesktopNavigationMenu = () => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanies();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b shadow-sm bg-[#F8F7F4] dark:bg-[#191919] hidden lg:block">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            {selectedCompany?.logo ? (
              <img 
                src={selectedCompany.logo} 
                alt={selectedCompany.nome} 
                className="h-8 w-8 object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/lovable-uploads/200a55db-c024-40f3-b628-d48307d84e93.png";
                }}
              />
            ) : (
              <img 
                src="/lovable-uploads/200a55db-c024-40f3-b628-d48307d84e93.png" 
                alt="MNNO School" 
                className="h-8 w-8"
              />
            )}
          </Link>
          
          <div className="flex items-center">
            <CompanySelector />
          </div>
          
          <NavMenuLinks />
        </div>
        
        <div className="flex items-center space-x-4">
          <SearchBar />
          <ThemeToggle />
          <NotificationButton />
          {user ? <UserNavigation /> : <AuthButtons />}
        </div>
      </div>
    </header>
  );
};
