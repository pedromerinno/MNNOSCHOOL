
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, School, MessageSquare, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";
import { CompanySelector } from "./CompanySelector";
import { UserNavigation } from "./UserNavigation";
import { AuthButtons } from "./AuthButtons";

export const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const location = useLocation();

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      label: "Início",
      path: "/",
      icon: Home,
      show: true
    },
    {
      label: "Escola",
      path: "/courses",
      icon: School,
      show: true
    },
    {
      label: "Fórum",
      path: "/community",
      icon: MessageSquare,
      show: true
    },
    {
      label: "Equipe",
      path: "/team",
      icon: Users,
      show: userProfile?.is_admin || userProfile?.super_admin
    },
    {
      label: userProfile?.super_admin ? "Super Admin" : "Admin",
      path: "/admin",
      icon: Settings,
      show: userProfile?.is_admin || userProfile?.super_admin
    }
  ];

  const visibleItems = menuItems.filter(item => item.show);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh] bg-[#F8F7F4] dark:bg-[#191919] border-t-0">
        <div className="h-1 w-16 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-6" />
        
        <DrawerHeader className="text-left pb-6">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Menu
            </DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>
        
        <div className="flex-1 px-6 pb-8 overflow-y-auto">
          <div className="mb-8">
            <CompanySelector />
          </div>
          
          <nav className="space-y-3 mb-10">
            {visibleItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                  isCurrentPath(item.path)
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-base font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="pt-6 border-t border-gray-200/60 dark:border-gray-700/60">
            {user ? (
              <div className="space-y-4">
                <UserNavigation />
              </div>
            ) : (
              <div className="space-y-3">
                <AuthButtons />
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
