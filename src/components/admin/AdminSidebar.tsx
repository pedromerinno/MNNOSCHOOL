
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  Building, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LayoutDashboard,
  BookOpenCheck
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.super_admin;

  const menuItems = [
    ...(isSuperAdmin ? [
      {
        title: "Plataforma",
        icon: LayoutDashboard,
        tab: "platform"
      }
    ] : []),
    {
      title: "Empresas",
      icon: Building,
      tab: "companies"
    },
    {
      title: "Usuários",
      icon: Users,
      tab: "users"
    },
    {
      title: "Todos os Cursos",
      icon: BookOpen,
      tab: "allcourses"
    },
    {
      title: "Sugestões de Cursos",
      icon: BookOpenCheck,
      tab: "suggested-courses"
    },
    {
      title: "Avisos",
      icon: MessageSquare,
      tab: "notices"
    },
    {
      title: "Configurações",
      icon: Settings,
      tab: "settings"
    }
  ];

  return (
    <Sidebar className="border-r">
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-sm font-medium text-sidebar-foreground/70">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.tab)}
                    isActive={activeTab === item.tab}
                    className="w-full justify-start h-10 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
