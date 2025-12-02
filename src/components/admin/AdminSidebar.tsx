
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
  BookOpenCheck,
  Globe
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const isSuperAdmin = userProfile?.super_admin;

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      tab: "dashboard"
    },
    ...(isSuperAdmin ? [
      {
        title: "Plataforma",
        icon: Globe,
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

  // Get company color for active item styling
  const companyColor = selectedCompany?.cor_principal || '#1EAEDB';

  return (
    <Sidebar 
      variant="inset" 
      className="border-r border-sidebar-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60"
    >
      <SidebarContent className="flex flex-col">
        <SidebarGroup className="flex-1 py-4">
          <SidebarGroupLabel className="px-4 py-3 text-sm font-semibold text-sidebar-foreground/80 border-b mb-6">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.tab;
                return (
                  <SidebarMenuItem key={item.tab}>
                    <SidebarMenuButton 
                      onClick={() => onTabChange(item.tab)}
                      isActive={isActive}
                      className={cn(
                        "w-full justify-start h-10 px-3 rounded-md",
                        "transition-all duration-200 ease-in-out",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "group relative",
                        isActive && "bg-sidebar-accent font-medium"
                      )}
                      style={isActive ? {
                        backgroundColor: `${companyColor}15`,
                        color: companyColor,
                      } : {}}
                    >
                      <item.icon 
                        className={cn(
                          "w-4 h-4 mr-3 flex-shrink-0 transition-colors",
                          isActive ? "" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                        )}
                        style={isActive ? { color: companyColor } : {}}
                      />
                      <span className="text-sm truncate">{item.title}</span>
                      {isActive && (
                        <div 
                          className="ml-auto w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: companyColor }}
                        />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
