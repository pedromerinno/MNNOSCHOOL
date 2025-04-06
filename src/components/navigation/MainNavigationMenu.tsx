
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NavMenuLinks } from "@/components/navigation/NavMenuLinks";
import { SearchBar } from "@/components/navigation/SearchBar";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { NotificationButton } from "@/components/navigation/NotificationButton";
import { UserNavigation } from "@/components/navigation/UserNavigation";
import { AuthButtons } from "@/components/navigation/AuthButtons";

export const MainNavigationMenu = () => {
  const { user } = useAuth();

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
            merinno
          </Link>
          
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
