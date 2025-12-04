
import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";
import { LucideIcon } from "lucide-react";
import { getSafeTextColor } from "@/lib/utils";

interface SettingsTabTriggerProps {
  value: string;
  icon: LucideIcon;
  label: string;
  activeTab: string;
  companyColor?: string;
}

export const SettingsTabTrigger: React.FC<SettingsTabTriggerProps> = ({
  value,
  icon: Icon,
  label,
  activeTab,
  companyColor
}) => {
  return (
    <TabsTrigger 
      value={value} 
      className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
      style={{
        borderColor: activeTab === value ? companyColor || "#1EAEDB" : "transparent",
        color: activeTab === value ? getSafeTextColor(companyColor || "#1EAEDB", false) : undefined
      }}
    >
      <Icon className="h-4 w-4 mr-2" style={{ color: activeTab === value ? getSafeTextColor(companyColor || "#1EAEDB", false) : undefined }} />
      {label}
    </TabsTrigger>
  );
};
