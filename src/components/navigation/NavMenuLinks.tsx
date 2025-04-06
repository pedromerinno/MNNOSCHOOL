
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const NavMenuLinks = () => {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const isAdmin = userProfile?.isAdmin === true;

  const adminLinks = isAdmin ? (
    <li>
      <Link 
        to="/admin" 
        className={cn(
          "text-sm text-[rgb(107_114_128)] dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light",
          isCurrentPage('/admin') && "font-bold text-gray-700"
        )}
      >
        Admin
      </Link>
    </li>
  ) : null;

  const isCurrentPage = (path: string) => location.pathname === path;

  return (
    <nav>
      <ul className="flex items-center space-x-6">
        <li>
          <Link 
            to="/" 
            className={cn(
              "text-sm text-[rgb(107_114_128)] dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light",
              isCurrentPage('/') && "font-bold text-gray-700"
            )}
          >
            Home
          </Link>
        </li>
        <li>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className={cn(
                    "bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-[rgb(107_114_128)] dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light text-sm",
                    isCurrentPage('/courses') && "font-bold text-gray-700"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen size={18} className={cn(
                      "text-[rgb(107_114_128)]",
                      isCurrentPage('/courses') && "text-gray-700"
                    )} />
                    <span>Cursos</span>
                  </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2 bg-white dark:bg-gray-800">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/courses"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Todos os Cursos</div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-500 dark:text-gray-400">
                            Visualize nosso catálogo completo de cursos disponíveis
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/courses?filter=in-progress"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Cursos em Andamento</div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-500 dark:text-gray-400">
                            Continue de onde parou nos seus cursos em andamento
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/courses?filter=completed"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Cursos Concluídos</div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-500 dark:text-gray-400">
                            Revise cursos que você já completou
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/courses?filter=recommended"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Recomendados</div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-500 dark:text-gray-400">
                            Cursos recomendados com base no seu perfil
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </li>
        <li>
          <Link 
            to="/tools" 
            className={cn(
              "flex items-center space-x-2 text-sm text-[rgb(107_114_128)] dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light",
              isCurrentPage('/tools') && "font-bold text-gray-700"
            )}
          >
            Ferramentas
            <Badge variant="beta" className="ml-2 text-xs px-2 py-1">beta</Badge>
          </Link>
        </li>
        {adminLinks}
      </ul>
    </nav>
  );
};
