
import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/navigation/SearchBar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserNavigation } from "@/components/navigation/UserNavigation";
import { NotificationButton } from "@/components/navigation/NotificationButton";

export const DashboardHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <div 
            onClick={handleLogoClick} 
            className="text-xl font-bold text-merinno-dark cursor-pointer"
          >
            MERINNO
          </div>
          
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
          <div className="hidden md:block">
            <SearchBar />
          </div>
          
          <NotificationButton />
          
          <UserNavigation avatarUrl="https://i.pravatar.cc/150?img=68" />
        </div>
      </div>
    </header>
  );
};
