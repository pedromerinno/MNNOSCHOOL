
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
    <Sidebar className="border-r min-h-full">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="flex-1 py-6">
          <SidebarGroupLabel className="px-4 py-3 text-sm font-semibold text-sidebar-foreground/80 border-b mb-4">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3 space-y-2 mt-2">
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.tab)}
                    isActive={activeTab === item.tab}
                    className={`
                      w-full justify-start h-11 px-3 py-2 rounded-lg 
                      transition-all duration-200 ease-in-out
                      hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                      data-[active=true]:bg-primary data-[active=true]:text-primary-foreground
                      data-[active=true]:shadow-sm data-[active=true]:font-medium
                      group
                    `}
                  >
                    <item.icon className={`
                      w-4 h-4 mr-3 flex-shrink-0 transition-colors
                      ${activeTab === item.tab ? 'text-primary-foreground' : 'text-sidebar-foreground/70'}
                      group-hover:text-sidebar-accent-foreground
                    `} />
                    <span className="text-sm font-medium truncate">{item.title}</span>
                    {activeTab === item.tab && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                    )}
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
