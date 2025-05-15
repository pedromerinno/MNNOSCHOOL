
import React from "react";
import {
  Building,
  Users,
  Settings,
  BookOpen,
  Bell,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.super_admin;

  const handleTabClick = (tab: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation
    if (activeTab !== tab) {
      onTabChange(tab);
    }
  };

  return (
    <Sidebar className="border-r border-border dark:border-gray-800 bg-background">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Administração
        </h2>
        <div className="space-y-1">
          {isSuperAdmin && (
            <Button
              variant={activeTab === "platform" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={(e) => handleTabClick("platform", e)}
            >
              <Layout className="mr-2 h-4 w-4" />
              Plataforma
            </Button>
          )}
          <Button
            variant={activeTab === "companies" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={(e) => handleTabClick("companies", e)}
          >
            <Building className="mr-2 h-4 w-4" />
            Empresas
          </Button>
          <Button
            variant={activeTab === "users" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={(e) => handleTabClick("users", e)}
          >
            <Users className="mr-2 h-4 w-4" />
            Usuários
          </Button>
          <Button
            variant={activeTab === "allcourses" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={(e) => handleTabClick("allcourses", e)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Cursos
          </Button>
          <Button
            variant={activeTab === "notices" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={(e) => handleTabClick("notices", e)}
          >
            <Bell className="mr-2 h-4 w-4" />
            Avisos
          </Button>
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={(e) => handleTabClick("settings", e)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Integrações
          </Button>
        </div>
      </div>
    </Sidebar>
  );
};
