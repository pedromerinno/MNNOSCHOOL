
import { Link } from "react-router-dom";
import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export const DashboardHeader = () => {
  const { signOut, user } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <Link to="/dashboard" className="text-xl font-bold text-merinno-dark">
            MERINNO
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-900 hover:text-merinno-blue"
            >
              Dashboard
            </Link>
            <Link
              to="/courses"
              className="text-sm font-medium text-gray-500 hover:text-merinno-blue"
            >
              Cursos
            </Link>
            <Link
              to="/schedule"
              className="text-sm font-medium text-gray-500 hover:text-merinno-blue"
            >
              Agenda
            </Link>
            <Link
              to="/community"
              className="text-sm font-medium text-gray-500 hover:text-merinno-blue"
            >
              Comunidade
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar..."
              className="pl-8 h-9 focus-visible:ring-merinno-blue"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-merinno-blue"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-500 hover:text-merinno-blue"
            >
              <User className="h-5 w-5" />
              {user && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </Button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
