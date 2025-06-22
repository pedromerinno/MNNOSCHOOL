
import { Link, useLocation } from "react-router-dom";
import { Home, School, MessageSquare, Users, Settings } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationButton } from "./NotificationButton";
import { MobileMenu } from "./MobileMenu";
import { CompanySelector } from "./CompanySelector";
import { useAuth } from "@/contexts/AuthContext";

export const MobileNavigationMenu = () => {
  const { userProfile } = useAuth();
  const location = useLocation();

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      label: "Início",
      path: "/",
      icon: Home,
      show: true
    },
    {
      label: "Escola",
      path: "/courses",
      icon: School,
      show: true
    },
    {
      label: "Fórum",
      path: "/community",
      icon: MessageSquare,
      show: true
    },
    {
      label: "Equipe",
      path: "/team",
      icon: Users,
      show: userProfile?.is_admin || userProfile?.super_admin
    },
    {
      label: userProfile?.super_admin ? "Super Admin" : "Admin",
      path: "/admin",
      icon: Settings,
      show: userProfile?.is_admin || userProfile?.super_admin
    }
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b shadow-sm bg-[#F8F7F4] dark:bg-[#191919] lg:hidden pt-safe-top">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 overflow-x-auto">
          <MobileMenu />
          <CompanySelector />
          
          {/* Menu items horizontally next to company name */}
          <nav className="flex items-center space-x-3 ml-2">
            {visibleItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 whitespace-nowrap text-sm ${
                  isCurrentPath(item.path)
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <SearchBar />
          <ThemeToggle />
          <NotificationButton />
        </div>
      </div>
    </header>
  );
};
