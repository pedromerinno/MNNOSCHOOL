
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";
import { useCompanies } from "@/hooks/useCompanies";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Puzzle,
  LockKeyhole, 
  FolderOpen, 
  MessageCircle 
} from "lucide-react";
import { getSafeTextColor, cn } from "@/lib/utils";
import * as React from "react";
import { Badge } from "@/components/ui/badge";

export const NavMenuLinks = ({ adminLabel = "Admin" }) => {
  const { selectedCompany } = useCompanies();
  const { userProfile, profileLoading } = useAuth();
  const { isAdmin, isSuperAdmin, isLoading } = useIsAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Garantir que o perfil está carregado antes de mostrar itens administrativos
  // IMPORTANTE: Só mostrar se TUDO estiver confirmado e não estiver carregando
  // E só mostrar se realmente for admin (não confiar em valores intermediários)
  const isReady = !profileLoading && !!userProfile && !isLoading;
  const shouldShowAdmin = isReady && (isAdmin || isSuperAdmin);
  
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
      color: getSafeTextColor(companyColor, false),
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
          <Link 
            to="/my-courses" 
            className={cn(menuLinkClass('/my-courses'), "flex items-center gap-2")}
            style={getLinkStyle('/my-courses')}
          >
            Escola
            <Badge variant="beta" className="text-xs">Beta</Badge>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium bg-transparent hover:bg-transparent px-4 py-2">
            Ferramentas
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr] min-h-[200px]">
              <li className="row-span-4">
                <NavigationMenuLink asChild>
                  <a
                    href="/integration"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/integration');
                    }}
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                    style={{
                      background: `linear-gradient(to bottom, ${companyColor}10, ${companyColor}05)`,
                    }}
                  >
                    <div className="mb-2 mt-4 text-lg font-semibold flex items-center gap-2" style={{ color: getSafeTextColor(companyColor, false) }}>
                      Ferramentas
                    </div>
                    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-500">
                      Acesse todas as ferramentas e recursos disponíveis para otimizar seu trabalho.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem 
                href="/integration" 
                title="Integração"
                icon={Puzzle}
                companyColor={companyColor}
              >
                Processo de integração e onboarding da empresa
              </ListItem>
              <ListItem 
                href="/access" 
                title="Senhas"
                icon={LockKeyhole}
                companyColor={companyColor}
              >
                Gerencie suas senhas e credenciais de acesso
              </ListItem>
              <ListItem 
                href="/documents" 
                title="Documentos"
                icon={FolderOpen}
                companyColor={companyColor}
              >
                Acesse seus documentos e materiais de estudo
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        {shouldShowAdmin && isAdmin && (
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
        
        {shouldShowAdmin && isAdmin && (
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
        
        {shouldShowAdmin && isSuperAdmin && (
          <NavigationMenuItem>
            <Link 
              to="/super-admin" 
              className={menuLinkClass('/super-admin')}
              style={getLinkStyle('/super-admin')}
            >
              Super Admin
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link> & {
    title: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    companyColor?: string;
  }
>(({ className, title, children, icon: Icon, companyColor, href, ...props }, ref) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href) {
      navigate(href);
    }
  };

  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          href={href}
          onClick={handleClick}
          className={cn(
            "block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 focus:bg-gray-50 dark:focus:bg-gray-900 group border border-transparent hover:border-gray-200 dark:hover:border-gray-800 cursor-pointer",
            className
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon 
                size={16} 
                className="transition-colors flex-shrink-0"
                style={{ color: companyColor ? getSafeTextColor(companyColor, false) : '#3B82F6' }}
              />
            )}
            <div 
              className="text-sm font-semibold leading-none text-gray-900 dark:text-gray-100"
              style={{ color: companyColor ? getSafeTextColor(companyColor, false) : undefined }}
            >
              {title}
            </div>
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-500 mt-2">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
