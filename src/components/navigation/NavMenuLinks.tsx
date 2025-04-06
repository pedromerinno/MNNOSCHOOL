
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, BookOpen, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export const NavMenuLinks = () => {
  const { user } = useAuth();

  const adminLinks = user?.email === 'admin@merinno.com' ? (
    <li>
      <Link 
        to="/admin" 
        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:dark:text-white"
      >
        <Settings size={20} className="mr-1" />
        <span>Admin</span>
      </Link>
    </li>
  ) : null;

  return (
    <nav>
      <ul className="flex items-center space-x-8">
        <li>
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:dark:text-white">
            Home
          </Link>
        </li>
        <li>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:dark:text-white">
                  <div className="flex items-center">
                    <BookOpen size={18} className="mr-1" />
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
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:dark:text-white"
          >
            <Wrench size={18} className="mr-1" />
            <span>Ferramentas</span>
          </Link>
        </li>
        {adminLinks}
      </ul>
    </nav>
  );
};
