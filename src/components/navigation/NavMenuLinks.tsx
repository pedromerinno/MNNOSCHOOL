
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const NavMenuLinks = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/" className="text-sm font-medium text-gray-900 px-4 py-2 hover:text-merinno-blue">
            Home
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-sm font-medium text-gray-500 hover:text-merinno-blue">
            Cursos
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-4 shadow-lg rounded-md min-w-[200px]">
            <ul className="space-y-2">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/courses" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md">
                    Todos os Cursos
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/courses?filter=inprogress" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md">
                    Em Progresso
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/courses?filter=completed" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md">
                    Concluídos
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-sm font-medium text-gray-500 hover:text-merinno-blue">
            Ferramentas
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
              beta
            </span>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-4 shadow-lg rounded-md min-w-[200px]">
            <ul className="space-y-2">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/tools/planner" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md">
                    Planejador
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/tools/calendar" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md">
                    Calendário
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
