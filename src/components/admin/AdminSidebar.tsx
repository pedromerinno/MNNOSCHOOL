
import React from 'react';
import { 
  Sidebar, 
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  Book, 
  Settings,
  ArrowLeftRight
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const { userProfile } = useAuth();
  
  // Define menu items based on user role
  const menuItems = [
    ...(userProfile?.super_admin ? [{
      value: "platform",
      label: "Plataforma",
      icon: LayoutDashboard,
    }] : []),
    {
      value: "companies",
      label: "Empresas",
      icon: Building,
    },
    {
      value: "users",
      label: "Usuários",
      icon: Users,
    },
    {
      value: "allcourses",
      label: "Cursos",
      icon: Book,
    },
    {
      value: "settings",
      label: "Configurações da Empresa",
      icon: Settings,
    }
  ];

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-sm font-semibold">
            Painel Administrativo
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    data-active={activeTab === item.value}
                    onClick={() => onTabChange(item.value)} 
                    tooltip={item.label}
                  >
                    <item.icon className={`h-5 w-5 ${activeTab === item.value ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 px-3 py-2">
        <div className="flex justify-center">
          <button
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => window.history.back()}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Voltar</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
