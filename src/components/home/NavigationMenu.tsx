import { Bell, Moon, Search, Sun, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const MainNavigationMenu = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, signOut } = useAuth();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Would implement actual theme toggling here
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <Link to="/" className="text-xl font-bold text-merinno-dark">
            merinno
          </Link>
          
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
                <NavigationMenuContent className="bg-white p-4 shadow-lg rounded-md min-w-[200px]">
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
                <NavigationMenuContent className="bg-white p-4 shadow-lg rounded-md min-w-[200px]">
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
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-gray-500 hover:text-merinno-blue"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisa..."
              className="pl-8 h-9 bg-gray-50 border-gray-200 focus-visible:ring-merinno-blue"
            />
          </div>
          
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-500 hover:text-merinno-blue rounded-full overflow-hidden"
                  >
                    <img 
                      src="https://i.pravatar.cc/150?img=68" 
                      alt="User avatar" 
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer flex items-center gap-2"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button className="rounded-full bg-merinno-dark hover:bg-black text-white">
                <Link to="/login" className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              
              <Button variant="outline" className="rounded-full border-merinno-dark text-merinno-dark hover:bg-merinno-dark hover:text-white">
                <Link to="/signup" className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastro
                </Link>
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-merinno-blue"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
              1
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};
