
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
import { useCompanies } from "@/hooks/useCompanies";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import { BookOpen, LayoutDashboard } from "lucide-react";

export const NavMenuLinks = ({ adminLabel = "Admin" }) => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();
  
  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };
  
  // Usar a cor primária da empresa ou fallback para azul
  const companyColor = selectedCompany?.cor_principal || '#3B82F6';
  
  const menuLinkClass = (path: string) => {
    const isActive = isCurrentPath(path);
    
    return `text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm px-4 py-2 rounded-md transition-colors ${
      isActive ? 'font-semibold' : 'font-medium'
    } ${
      isActive ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;
  };

  const getLinkStyle = (path: string) => {
    const isActive = isCurrentPath(path);
    if (!isActive) return {};
    
    return {
      backgroundColor: `${companyColor}15`,
      color: companyColor,
    };
  };
  
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex items-center space-x-8">
        <NavigationMenuItem>
          <Link 
            to="/" 
            className={menuLinkClass('/')}
            style={getLinkStyle('/')}
          >
            Início
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium bg-transparent hover:bg-transparent px-4 py-2">
            Escola
          </NavigationMenuTrigger>
          <NavigationMenuContent className="min-w-[520px] bg-white dark:bg-gray-950 p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-2 gap-4">
              <Link to="/courses" className="group p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="mt-1" style={{ color: companyColor }}>
                    <BookOpen size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium mb-1 group-hover:text-gray-900 dark:group-hover:text-white text-left" style={{ color: companyColor }}>
                      Todos os Cursos
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                      Visualize todos os cursos disponíveis na sua empresa
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link to="/my-courses" className="group p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="mt-1" style={{ color: companyColor }}>
                    <LayoutDashboard size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium mb-1 group-hover:text-gray-900 dark:group-hover:text-white text-left" style={{ color: companyColor }}>
                      Painel
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                      Cursos favoritos e em andamento
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link 
            to="/community" 
            className={menuLinkClass('/community')}
            style={getLinkStyle('/community')}
          >
            Fórum
          </Link>
        </NavigationMenuItem>
        
        {isAdmin && (
          <NavigationMenuItem>
            <Link 
              to="/team" 
              className={menuLinkClass('/team')}
              style={getLinkStyle('/team')}
            >
              Equipe
            </Link>
          </NavigationMenuItem>
        )}
        
        {isAdmin && (
          <NavigationMenuItem>
            <Link 
              to="/admin" 
              className={menuLinkClass('/admin')}
              style={getLinkStyle('/admin')}
            >
              {adminLabel}
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
