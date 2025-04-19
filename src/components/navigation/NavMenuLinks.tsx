
import { Link } from "react-router-dom";
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const NavMenuLinks = () => {
  const { userProfile } = useAuth();
  
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex items-center space-x-6">
        <NavigationMenuItem>
          <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
            Home
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
            School
            <ChevronDown className="ml-1 h-4 w-4" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            {/* Add school-related dropdown items if needed */}
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/community" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
            Comunidade
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/team" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
            Equipe
          </Link>
        </NavigationMenuItem>
        
        {(userProfile?.is_admin || userProfile?.super_admin) && (
          <NavigationMenuItem>
            <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
              Admin
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
