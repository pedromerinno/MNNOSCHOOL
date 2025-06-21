
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
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between">
            <DrawerTitle>Menu</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DrawerHeader>
        
        <div className="px-4 py-2">
          <div className="mb-6">
            <CompanySelector />
          </div>
          
          <nav className="space-y-2">
            {visibleItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isCurrentPath(item.path)
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-base">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
