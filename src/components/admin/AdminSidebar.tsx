
import React from 'react';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Building, Users, Book, Settings, ArrowLeftRight, Bell } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar = ({
  activeTab,
  onTabChange
}: AdminSidebarProps) => {
  const {
    userProfile
  } = useAuth();

  // Define menu items based on user role
  const menuItems = [
    ...(userProfile?.super_admin ? [{
      value: "platform",
      label: "Plataforma",
      icon: LayoutDashboard
    }] : []),
    {
      value: "companies",
      label: "Empresas",
      icon: Building
    },
    {
      value: "users",
      label: "Usuários",
      icon: Users
    },
    {
      value: "allcourses",
      label: "Cursos",
      icon: Book
    },
    {
      value: "notices",
      label: "Avisos",
      icon: Bell
    },
    {
      value: "settings",
      label: "Configurações",
      icon: Settings
    }
  ];

  // Improved click handler with explicit handling for different types of events
  const handleMenuClick = (value: string) => (e: React.MouseEvent) => {
    // Ensure we're preventing all default behaviors
    e.preventDefault();
    e.stopPropagation();
    
    // Only trigger tab change if it's actually changing
    if (activeTab !== value) {
      // Update the URL without causing a page refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', value);
      window.history.pushState({}, '', newUrl);
      
      // Call the handler to update the state
      onTabChange(value);
    }
  };

  return <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      <SidebarContent className="mx-0 py-[70px]">
        <SidebarGroup>
          <SidebarGroupContent className="pt-4">
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    data-active={activeTab === item.value} 
                    onClick={handleMenuClick(item.value)}
                    tooltip={item.label} 
                    className="py-[30px] px-[30px]"
                  >
                    <item.icon className={`h-5 w-5 ${activeTab === item.value ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 px-3 py-2">
        <div className="flex justify-center">
          <button 
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Voltar</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>;
};
