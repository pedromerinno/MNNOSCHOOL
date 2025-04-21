
import { Link, useLocation } from "react-router-dom";
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";

export const NavMenuLinks = ({ adminLabel = "Admin" }) => {
  const { userProfile } = useAuth();
  const location = useLocation();
  
  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };
  
  const menuLinkClass = (path: string) => {
    return `text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm px-4 py-2 ${
      isCurrentPath(path) ? 'font-bold' : 'font-medium'
    }`;
  };
  
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex items-center space-x-8">
        <NavigationMenuItem>
          <Link to="/" className={menuLinkClass('/')}>
            Home
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium bg-transparent hover:bg-transparent px-4 py-2">
            School
          </NavigationMenuTrigger>
          <NavigationMenuContent className="min-w-[400px] bg-white dark:bg-gray-950 p-3 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 gap-2">
              <Link to="/courses" className="group p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-0.5 group-hover:text-gray-900 dark:group-hover:text-white">
                      All Courses
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      View all courses available in your company
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link to="/my-courses" className="group p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 19V5a2 2 0 012-2h13.4a.6.6 0 01.6.6v13.114" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6 17h14M6 13h14M6 9h14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-0.5 group-hover:text-gray-900 dark:group-hover:text-white">
                      Dashboard
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Favorited and ongoing courses
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/community" className={menuLinkClass('/community')}>
            Comunidade
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/team" className={menuLinkClass('/team')}>
            Equipe
          </Link>
        </NavigationMenuItem>
        
        {(userProfile?.is_admin || userProfile?.super_admin) && (
          <NavigationMenuItem>
            <Link to="/admin" className={menuLinkClass('/admin')}>
              {adminLabel}
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
