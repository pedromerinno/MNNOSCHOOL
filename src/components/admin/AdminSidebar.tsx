
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.tab)}
                    isActive={activeTab === item.tab}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
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
