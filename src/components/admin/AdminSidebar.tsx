
import React, { useCallback, useRef } from 'react';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Building, Users, Book, Settings, ArrowLeftRight, Bell } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const clickTimeRef = useRef<number>(0);
  const isHandlingClickRef = useRef<boolean>(false);

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

  // Improved navigation handler with better debounce
  const handleNavigation = useCallback((e: React.MouseEvent, tabValue: string) => {
    // Prevent default to stop any potential navigation
    e.preventDefault();
    
    // Implement debounce to prevent double clicks
    const now = Date.now();
    if (now - clickTimeRef.current < 500 || isHandlingClickRef.current) {
      console.log("Debouncing click, ignoring duplicate");
      return;
    }
    
    clickTimeRef.current = now;
    isHandlingClickRef.current = true;
    
    console.log(`Tab navigation: ${tabValue}`);
    
    // Update tab state without causing a reload
    onTabChange(tabValue);
    
    // Reset handling flag after a delay
    setTimeout(() => {
      isHandlingClickRef.current = false;
    }, 500);
  }, [onTabChange]);

  // Prevent default and use React Router for back navigation
  const handleReturn = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigate(-1);
  }, [navigate]);

  return <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      <SidebarContent className="mx-0 py-[70px]">
        <SidebarGroup>
          <SidebarGroupContent className="pt-4">
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    data-active={activeTab === item.value} 
                    onClick={(e) => handleNavigation(e, item.value)} 
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
            onClick={handleReturn}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Voltar</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>;
};
