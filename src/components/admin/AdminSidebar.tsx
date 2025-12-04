
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCompanies } from '@/hooks/useCompanies';
import { cn, getSafeTextColor } from '@/lib/utils';
import { AdminTabId, AdminTabConfig } from '@/types/admin';

interface AdminSidebarProps {
  activeTab: AdminTabId;
  onTabChange: (tab: AdminTabId) => void;
  menuItems: AdminTabConfig[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange, menuItems }) => {
  const { selectedCompany } = useCompanies();

  // Get company color for active item styling
  const companyColor = selectedCompany?.cor_principal || '#1EAEDB';

  return (
    <Sidebar 
      variant="inset" 
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarContent className="flex flex-col">
        <SidebarGroup className="flex-1 py-4">
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => onTabChange(item.id)}
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
                        color: getSafeTextColor(companyColor, false),
                      } : {}}
                    >
                      <Icon 
                        className={cn(
                          "w-5 h-5 mr-3 flex-shrink-0 transition-all duration-200",
                          isActive ? "" : "text-sidebar-foreground/30 group-hover:text-sidebar-accent-foreground/70"
                        )}
                        style={isActive ? { color: getSafeTextColor(companyColor, false) } : {}}
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
