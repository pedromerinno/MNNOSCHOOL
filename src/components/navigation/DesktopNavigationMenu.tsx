
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CompanySelector } from "./CompanySelector";
import { UserNavigation } from "./UserNavigation";
import { AuthButtons } from "./AuthButtons";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationButton } from "./NotificationButton";
import { NavMenuLinks } from "./NavMenuLinks";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

export const DesktopNavigationMenu = () => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanies();
  const location = useLocation();
  const navigate = useNavigate();

  const showBackButton = location.pathname !== '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b shadow-sm bg-[#F8F7F4] dark:bg-[#191919] hidden lg:block">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 hover:bg-transparent" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          )}
          
          <Link to="/" className="flex items-center space-x-3">
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
        </div>
        
        <NavMenuLinks />
        
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
